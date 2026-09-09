export const MAX_DIMENSION = 1600;
export const JPEG_QUALITY = 0.82;
export const MAX_BATCH_SIZE = 10;

export function formatPhotoDate(iso) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function groupPhotosByBatch(photos) {
    const order = [];
    const byKey = new Map();
    for (const p of photos) {
        const key = p.batch_id || `solo-${p.id}`;
        if (!byKey.has(key)) {
            byKey.set(key, { key, name: p.name, caption: p.caption, created_at: p.created_at, photos: [] });
            order.push(key);
        }
        byKey.get(key).photos.push(p);
    }
    return order.map((key) => byKey.get(key));
}

export async function compressImage(file) {
    let bitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        bitmap = await createImageBitmap(file);
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
