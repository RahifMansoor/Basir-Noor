#!/usr/bin/env python3
"""
process_monitor.py
-------------------
A background system/process monitor that logs CPU, memory, disk, network,
and (if available) GPU usage per-process and system-wide, then flags
anomalies against a learned baseline: sudden resource spikes, brand-new
processes, processes launched from suspicious locations, unusual network
behavior, and duplicate/renamed process patterns.

Requirements:
    pip install psutil
    pip install gputil          (optional, for NVIDIA GPU stats)

Usage:
    python process_monitor.py --run                # run continuously, logging + detecting
    python process_monitor.py --report              # print a summary of anomalies found so far
    python process_monitor.py --report --hours 24   # anomalies from last 24h only
    python process_monitor.py --run --interval 5    # sample every 5 seconds (default 10)

Data is stored in a local SQLite DB (monitor_data.db) in the same folder,
so you can stop/restart the script and it keeps learning over time. The
longer it runs, the better its "normal" baseline becomes, so let it run
for at least a few hours (ideally a day+) before trusting anomaly output.

Everything runs locally. Nothing is sent anywhere over the network.
"""

import argparse
import datetime
import json
import os
import platform
import sqlite3
import statistics
import sys
import time
import traceback

try:
    import psutil
except ImportError:
    sys.exit("This script requires psutil. Install it with: pip install psutil")

# Optional GPU support (NVIDIA only, via GPUtil which wraps nvidia-smi)
try:
    import GPUtil
    HAS_GPU = True
except ImportError:
    HAS_GPU = False

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "monitor_data.db")
LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anomalies.log")

# ---------------------------------------------------------------------------
# Tunable thresholds — adjust to taste
# ---------------------------------------------------------------------------
CPU_ZSCORE_THRESHOLD = 3.0        # how many std-devs above a process's own history counts as a spike
MEM_ZSCORE_THRESHOLD = 3.0
MIN_SAMPLES_FOR_BASELINE = 15     # need this many prior samples of a process before z-score is trusted
NEW_PROCESS_CPU_ALERT = 20.0      # a never-before-seen process using >20% CPU immediately is notable
NEW_PROCESS_MEM_ALERT = 500.0     # or using more than 500MB RAM right out of the gate
HIGH_CONN_COUNT_ALERT = 40        # unusually many open network connections for one process
SUSPICIOUS_PATH_FRAGMENTS = [
    "temp", "tmp", "appdata\\local\\temp", "/tmp/", "downloads",
    ".cache", "/dev/shm", "recycle.bin", "$recycle.bin",
]


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS samples (
            ts REAL, pid INTEGER, name TEXT, exe TEXT, username TEXT,
            cpu_pct REAL, mem_pct REAL, mem_mb REAL, num_threads INTEGER,
            num_conns INTEGER, gpu_pct REAL, gpu_mem_mb REAL, create_time REAL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS system_samples (
            ts REAL, cpu_pct REAL, mem_pct REAL,
            net_sent_mb REAL, net_recv_mb REAL, disk_read_mb REAL, disk_write_mb REAL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS anomalies (
            ts REAL, pid INTEGER, name TEXT, exe TEXT, reason TEXT, detail TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS known_processes (
            name TEXT PRIMARY KEY, first_seen REAL
        )
    """)
    conn.commit()
    return conn


# ---------------------------------------------------------------------------
# GPU helpers
# ---------------------------------------------------------------------------
def get_gpu_snapshot():
    """Returns dict pid -> (gpu_pct, gpu_mem_mb) if obtainable, else {}."""
    if not HAS_GPU:
        return {}
    try:
        gpus = GPUtil.getGPUs()
        # GPUtil doesn't map per-process on all platforms; we approximate by
        # attributing overall GPU load evenly is misleading, so instead we
        # just record system-wide GPU stats separately (see system snapshot).
        return {}
    except Exception:
        return {}


def get_system_gpu_stats():
    if not HAS_GPU:
        return None
    try:
        gpus = GPUtil.getGPUs()
        if not gpus:
            return None
        # Report the busiest GPU if multiple
        g = max(gpus, key=lambda x: x.load)
        return {"load_pct": g.load * 100, "mem_used_mb": g.memoryUsed, "mem_total_mb": g.memoryTotal}
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Sampling
# ---------------------------------------------------------------------------
def is_suspicious_path(exe_path):
    if not exe_path:
        return False
    p = exe_path.lower()
    return any(frag in p for frag in SUSPICIOUS_PATH_FRAGMENTS)


def sample_processes(conn, ts):
    """Take one snapshot of all running processes and store it."""
    c = conn.cursor()
    rows = []
    for proc in psutil.process_iter(attrs=["pid", "name", "exe", "username", "create_time"]):
        try:
            info = proc.info
            cpu = proc.cpu_percent(interval=None)  # non-blocking, relative to last call
            mem_pct = proc.memory_percent()
            mem_mb = proc.memory_info().rss / (1024 * 1024)
            try:
                num_threads = proc.num_threads()
            except Exception:
                num_threads = 0
            try:
                if hasattr(proc, "net_connections"):
                    num_conns = len(proc.net_connections(kind="inet"))
                else:
                    num_conns = len(proc.connections(kind="inet"))
            except Exception:
                num_conns = 0

            rows.append((
                ts, info["pid"], info["name"] or "unknown", info["exe"] or "",
                info["username"] or "", cpu, mem_pct, mem_mb, num_threads,
                num_conns, None, None, info["create_time"] or 0
            ))
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    c.executemany("""
        INSERT INTO samples (ts, pid, name, exe, username, cpu_pct, mem_pct,
                              mem_mb, num_threads, num_conns, gpu_pct, gpu_mem_mb, create_time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, rows)
    conn.commit()
    return rows


def sample_system(conn, ts, prev_net, prev_disk):
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    net = psutil.net_io_counters()
    disk = psutil.disk_io_counters()

    net_sent_mb = net_recv_mb = disk_read_mb = disk_write_mb = 0.0
    if prev_net is not None:
        net_sent_mb = max(0, (net.bytes_sent - prev_net.bytes_sent) / (1024 * 1024))
        net_recv_mb = max(0, (net.bytes_recv - prev_net.bytes_recv) / (1024 * 1024))
    if prev_disk is not None and disk is not None:
        disk_read_mb = max(0, (disk.read_bytes - prev_disk.read_bytes) / (1024 * 1024))
        disk_write_mb = max(0, (disk.write_bytes - prev_disk.write_bytes) / (1024 * 1024))

    c = conn.cursor()
    c.execute("""
        INSERT INTO system_samples (ts, cpu_pct, mem_pct, net_sent_mb, net_recv_mb, disk_read_mb, disk_write_mb)
        VALUES (?,?,?,?,?,?,?)
    """, (ts, cpu, mem, net_sent_mb, net_recv_mb, disk_read_mb, disk_write_mb))
    conn.commit()

    gpu_stats = get_system_gpu_stats()
    return net, disk, cpu, mem, net_sent_mb, net_recv_mb, gpu_stats


# ---------------------------------------------------------------------------
# Anomaly detection
# ---------------------------------------------------------------------------
def log_anomaly(conn, ts, pid, name, exe, reason, detail):
    c = conn.cursor()
    c.execute("INSERT INTO anomalies (ts, pid, name, exe, reason, detail) VALUES (?,?,?,?,?,?)",
               (ts, pid, name, exe, reason, detail))
    conn.commit()
    line = f"[{datetime.datetime.fromtimestamp(ts)}] {reason} | proc={name} pid={pid} exe={exe} | {detail}"
    print("!! ANOMALY:", line)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")


def check_new_process(conn, ts, name, pid, exe, cpu, mem_mb):
    c = conn.cursor()
    c.execute("SELECT 1 FROM known_processes WHERE name = ?", (name,))
    seen = c.fetchone()
    if not seen:
        c.execute("INSERT OR IGNORE INTO known_processes (name, first_seen) VALUES (?, ?)", (name, ts))
        conn.commit()
        if cpu >= NEW_PROCESS_CPU_ALERT or mem_mb >= NEW_PROCESS_MEM_ALERT:
            log_anomaly(conn, ts, pid, name, exe, "NEW_PROCESS_HIGH_USAGE",
                        f"first time seen, cpu={cpu:.1f}%, mem={mem_mb:.0f}MB")


def check_history_zscore(conn, ts, name, pid, exe, cpu, mem_mb):
    c = conn.cursor()
    # Look at this process's own history (by name) over the last ~2000 samples, excluding this instant
    c.execute("""
        SELECT cpu_pct, mem_mb FROM samples
        WHERE name = ? AND ts < ?
        ORDER BY ts DESC LIMIT 2000
    """, (name, ts))
    history = c.fetchall()
    if len(history) < MIN_SAMPLES_FOR_BASELINE:
        return
    cpu_hist = [h[0] for h in history]
    mem_hist = [h[1] for h in history]

    def zscore(value, series):
        try:
            mu = statistics.mean(series)
            sigma = statistics.pstdev(series)
            if sigma < 1e-6:
                return 0.0
            return (value - mu) / sigma
        except statistics.StatisticsError:
            return 0.0

    cz = zscore(cpu, cpu_hist)
    mz = zscore(mem_mb, mem_hist)
    if cz >= CPU_ZSCORE_THRESHOLD:
        log_anomaly(conn, ts, pid, name, exe, "CPU_SPIKE",
                    f"cpu={cpu:.1f}% is z={cz:.1f} above its own baseline (avg {statistics.mean(cpu_hist):.1f}%)")
    if mz >= MEM_ZSCORE_THRESHOLD:
        log_anomaly(conn, ts, pid, name, exe, "MEMORY_SPIKE",
                    f"mem={mem_mb:.0f}MB is z={mz:.1f} above its own baseline (avg {statistics.mean(mem_hist):.0f}MB)")


def check_suspicious_path(conn, ts, name, pid, exe, cpu, mem_mb):
    if is_suspicious_path(exe) and (cpu > 5 or mem_mb > 100):
        log_anomaly(conn, ts, pid, name, exe, "SUSPICIOUS_PATH",
                    f"running from a temp/cache/downloads-like path with cpu={cpu:.1f}% mem={mem_mb:.0f}MB")


def check_connections(conn, ts, name, pid, exe, num_conns):
    if num_conns >= HIGH_CONN_COUNT_ALERT:
        log_anomaly(conn, ts, pid, name, exe, "HIGH_CONNECTION_COUNT",
                    f"{num_conns} simultaneous network connections")


def check_duplicate_instances(conn, ts, rows):
    """Flags a process name suddenly running far more copies than usual (e.g. 1 -> 15)."""
    from collections import Counter
    counts = Counter(r[2] for r in rows)  # name is index 2
    c = conn.cursor()
    for name, count in counts.items():
        if count < 6:
            continue
        c.execute("""
            SELECT AVG(cnt) FROM (
                SELECT ts, COUNT(*) as cnt FROM samples
                WHERE name = ? AND ts < ? GROUP BY ts
                ORDER BY ts DESC LIMIT 50
            )
        """, (name, ts))
        avg_row = c.fetchone()
        avg_count = avg_row[0] if avg_row and avg_row[0] else 1
        if count > max(3, avg_count * 3):
            log_anomaly(conn, ts, None, name, "", "DUPLICATE_INSTANCE_SPIKE",
                        f"{count} instances running at once (baseline ~{avg_count:.1f})")


def run_anomaly_checks(conn, ts, rows):
    for row in rows:
        (_, pid, name, exe, username, cpu, mem_pct, mem_mb, num_threads,
         num_conns, gpu_pct, gpu_mem_mb, create_time) = row
        check_new_process(conn, ts, name, pid, exe, cpu, mem_mb)
        check_history_zscore(conn, ts, name, pid, exe, cpu, mem_mb)
        check_suspicious_path(conn, ts, name, pid, exe, cpu, mem_mb)
        check_connections(conn, ts, name, pid, exe, num_conns)
    check_duplicate_instances(conn, ts, rows)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def run(interval):
    conn = init_db()
    print(f"[{platform.system()}] Monitoring started. Sampling every {interval}s.")
    print(f"DB: {DB_PATH}")
    print(f"Anomaly log: {LOG_PATH}")
    print("GPU monitoring:", "enabled (GPUtil found)" if HAS_GPU else "disabled (pip install gputil to enable)")
    print("Press Ctrl+C to stop.\n")

    # Prime psutil's cpu_percent so the first real reading is meaningful
    for proc in psutil.process_iter():
        try:
            proc.cpu_percent(interval=None)
        except Exception:
            pass
    psutil.cpu_percent(interval=None)

    prev_net = psutil.net_io_counters()
    prev_disk = psutil.disk_io_counters()
    time.sleep(1)

    try:
        while True:
            ts = time.time()
            rows = sample_processes(conn, ts)
            prev_net, prev_disk, sys_cpu, sys_mem, net_sent, net_recv, gpu_stats = sample_system(
                conn, ts, prev_net, prev_disk
            )
            run_anomaly_checks(conn, ts, rows)

            gpu_str = ""
            if gpu_stats:
                gpu_str = f" | GPU {gpu_stats['load_pct']:.0f}% ({gpu_stats['mem_used_mb']:.0f}/{gpu_stats['mem_total_mb']:.0f}MB)"
            print(f"[{datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')}] "
                  f"CPU {sys_cpu:.1f}% | RAM {sys_mem:.1f}% | "
                  f"Net +{net_sent:.2f}MB/-{net_recv:.2f}MB{gpu_str} | {len(rows)} processes", end="\r")

            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopped by user.")
    except Exception:
        traceback.print_exc()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------
def report(hours):
    if not os.path.exists(DB_PATH):
        print("No data yet — run with --run first.")
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    cutoff = time.time() - hours * 3600
    c.execute("""
        SELECT ts, pid, name, exe, reason, detail FROM anomalies
        WHERE ts >= ? ORDER BY ts DESC
    """, (cutoff,))
    anomalies = c.fetchall()

    print(f"\n=== Anomaly report (last {hours}h) ===")
    if not anomalies:
        print("No anomalies recorded in this window.")
    else:
        by_reason = {}
        for ts, pid, name, exe, reason, detail in anomalies:
            by_reason.setdefault(reason, []).append((ts, pid, name, exe, detail))

        for reason, items in sorted(by_reason.items(), key=lambda x: -len(x[1])):
            print(f"\n-- {reason} ({len(items)}) --")
            for ts, pid, name, exe, detail in items[:15]:
                when = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
                print(f"  [{when}] {name} (pid={pid})  {detail}")
                if exe:
                    print(f"           path: {exe}")

    # Top resource consumers overall, for context
    c.execute("""
        SELECT name, AVG(cpu_pct) as avg_cpu, MAX(cpu_pct) as max_cpu,
               AVG(mem_mb) as avg_mem, MAX(mem_mb) as max_mem, COUNT(*) as n
        FROM samples WHERE ts >= ?
        GROUP BY name ORDER BY avg_cpu DESC LIMIT 10
    """, (cutoff,))
    top = c.fetchall()
    print(f"\n=== Top CPU consumers (last {hours}h, by average) ===")
    for name, avg_cpu, max_cpu, avg_mem, max_mem, n in top:
        print(f"  {name:<30} avg_cpu={avg_cpu:5.1f}%  max_cpu={max_cpu:5.1f}%  "
              f"avg_mem={avg_mem:7.0f}MB  max_mem={max_mem:7.0f}MB  (n={n})")

    conn.close()


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Background process monitor + anomaly detector")
    parser.add_argument("--run", action="store_true", help="Start continuous monitoring")
    parser.add_argument("--report", action="store_true", help="Print anomaly report and stop")
    parser.add_argument("--interval", type=int, default=10, help="Seconds between samples (default 10)")
    parser.add_argument("--hours", type=int, default=24, help="Report window in hours (default 24)")
    args = parser.parse_args()

    if args.report:
        report(args.hours)
    elif args.run:
        run(args.interval)
    else:
        parser.print_help()