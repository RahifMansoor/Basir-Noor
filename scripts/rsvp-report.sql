-- RSVP report for Neon/Postgres.
-- Paste this whole file into the Neon SQL Editor and run it.

-- Result 1: overall RSVP totals.
WITH event_rows AS (
    SELECT
        r.id,
        r.name,
        events.event_label,
        events.is_attending,
        COALESCE(guest_counts.additional_guest_count, 0) AS additional_guest_count
    FROM rsvps r
    CROSS JOIN LATERAL (
        VALUES
            ('Dua E Khair',      'duaEKhair', r.dua_e_khair),
            ('Mehndi',           'mehndi',    r.mehndi),
            ('Nikkah Ceremony',  'barat',     r.barat),
            ('Welcome Bride',    'dholki',    r.welcome_dulhan),
            ('Walima',           'walima',    r.walima)
    ) AS events(event_label, guest_key, is_attending)
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS additional_guest_count
        FROM jsonb_array_elements_text(
            CASE
                WHEN jsonb_typeof(r.guests) = 'object'
                    AND jsonb_typeof(r.guests -> events.guest_key) = 'array'
                THEN r.guests -> events.guest_key
                ELSE '[]'::jsonb
            END
        )
    ) AS guest_counts ON TRUE
)
SELECT
    COUNT(DISTINCT id) AS rsvp_households,
    COUNT(*) FILTER (WHERE is_attending) AS event_yes_responses,
    COALESCE(SUM(additional_guest_count) FILTER (WHERE is_attending), 0) AS additional_guests_coming,
    COALESCE(SUM(1 + additional_guest_count) FILTER (WHERE is_attending), 0) AS total_event_attendance
FROM event_rows;

-- Result 2: counts by event.
WITH event_rows AS (
    SELECT
        r.id,
        r.name,
        events.sort_order,
        events.event_label,
        events.guest_key,
        events.is_attending,
        COALESCE((r.guests -> '_unable' ->> events.guest_key)::boolean, false) AS marked_unable,
        COALESCE(guest_counts.additional_guest_count, 0) AS additional_guest_count
    FROM rsvps r
    CROSS JOIN LATERAL (
        VALUES
            (1, 'Dua E Khair',      'duaEKhair', r.dua_e_khair),
            (2, 'Mehndi',           'mehndi',    r.mehndi),
            (3, 'Nikkah Ceremony',  'barat',     r.barat),
            (4, 'Welcome Bride',    'dholki',    r.welcome_dulhan),
            (5, 'Walima',           'walima',    r.walima)
    ) AS events(sort_order, event_label, guest_key, is_attending)
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS additional_guest_count
        FROM jsonb_array_elements_text(
            CASE
                WHEN jsonb_typeof(r.guests) = 'object'
                    AND jsonb_typeof(r.guests -> events.guest_key) = 'array'
                THEN r.guests -> events.guest_key
                ELSE '[]'::jsonb
            END
        )
    ) AS guest_counts ON TRUE
)
SELECT
    event_label AS event,
    COUNT(*) FILTER (WHERE is_attending) AS households_coming,
    COALESCE(SUM(additional_guest_count) FILTER (WHERE is_attending), 0) AS additional_guests_coming,
    COALESCE(SUM(1 + additional_guest_count) FILTER (WHERE is_attending), 0) AS total_people_coming,
    COUNT(*) FILTER (WHERE marked_unable) AS households_marked_unable,
    COUNT(*) FILTER (WHERE NOT is_attending AND NOT marked_unable) AS households_not_selected
FROM event_rows
GROUP BY sort_order, event_label
ORDER BY sort_order;

-- Result 3: one row per RSVP, showing who they are bringing and event status.
WITH event_rows AS (
    SELECT
        r.id,
        r.name,
        r.phone,
        r.email,
        r.updated_at,
        events.sort_order,
        events.event_label,
        events.guest_key,
        events.is_attending,
        COALESCE((r.guests -> '_unable' ->> events.guest_key)::boolean, false) AS marked_unable,
        COALESCE(guest_lists.additional_guests, 'None') AS additional_guests,
        COALESCE(guest_lists.additional_guest_count, 0) AS additional_guest_count
    FROM rsvps r
    CROSS JOIN LATERAL (
        VALUES
            (1, 'Dua E Khair',      'duaEKhair', r.dua_e_khair),
            (2, 'Mehndi',           'mehndi',    r.mehndi),
            (3, 'Nikkah Ceremony',  'barat',     r.barat),
            (4, 'Welcome Bride',    'dholki',    r.welcome_dulhan),
            (5, 'Walima',           'walima',    r.walima)
    ) AS events(sort_order, event_label, guest_key, is_attending)
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS additional_guest_count,
            COALESCE(string_agg(guest_name, ', ' ORDER BY guest_name), 'None') AS additional_guests
        FROM jsonb_array_elements_text(
            CASE
                WHEN jsonb_typeof(r.guests) = 'object'
                    AND jsonb_typeof(r.guests -> events.guest_key) = 'array'
                THEN r.guests -> events.guest_key
                ELSE '[]'::jsonb
            END
        ) AS guest_names(guest_name)
    ) AS guest_lists ON TRUE
)
SELECT
    name,
    phone,
    email,
    COALESCE(string_agg(event_label, ', ' ORDER BY sort_order) FILTER (WHERE is_attending), 'None') AS coming_to,
    COALESCE(string_agg(event_label, ', ' ORDER BY sort_order) FILTER (WHERE marked_unable), 'None') AS marked_unable_for,
    COALESCE(string_agg(event_label, ', ' ORDER BY sort_order) FILTER (WHERE NOT is_attending AND NOT marked_unable), 'None') AS not_selected,
    COALESCE(
        string_agg(
            event_label || ': ' || additional_guests,
            ' | '
            ORDER BY sort_order
        ) FILTER (WHERE is_attending),
        'None'
    ) AS guests_bringing_by_event,
    COALESCE(SUM(1 + additional_guest_count) FILTER (WHERE is_attending), 0) AS total_people_across_selected_events,
    updated_at
FROM event_rows
GROUP BY id, name, phone, email, updated_at
ORDER BY updated_at DESC, name;

-- Result 4: one row per RSVP per event for filtering/exporting.
WITH event_rows AS (
    SELECT
        r.name,
        r.phone,
        r.email,
        r.updated_at,
        events.sort_order,
        events.event_label,
        events.guest_key,
        events.is_attending,
        COALESCE((r.guests -> '_unable' ->> events.guest_key)::boolean, false) AS marked_unable,
        COALESCE(guest_lists.additional_guests, 'None') AS additional_guests,
        COALESCE(guest_lists.additional_guest_count, 0) AS additional_guest_count
    FROM rsvps r
    CROSS JOIN LATERAL (
        VALUES
            (1, 'Dua E Khair',      'duaEKhair', r.dua_e_khair),
            (2, 'Mehndi',           'mehndi',    r.mehndi),
            (3, 'Nikkah Ceremony',  'barat',     r.barat),
            (4, 'Welcome Bride',    'dholki',    r.welcome_dulhan),
            (5, 'Walima',           'walima',    r.walima)
    ) AS events(sort_order, event_label, guest_key, is_attending)
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS additional_guest_count,
            COALESCE(string_agg(guest_name, ', ' ORDER BY guest_name), 'None') AS additional_guests
        FROM jsonb_array_elements_text(
            CASE
                WHEN jsonb_typeof(r.guests) = 'object'
                    AND jsonb_typeof(r.guests -> events.guest_key) = 'array'
                THEN r.guests -> events.guest_key
                ELSE '[]'::jsonb
            END
        ) AS guest_names(guest_name)
    ) AS guest_lists ON TRUE
)
SELECT
    event_label AS event,
    name,
    CASE
        WHEN is_attending THEN 'Coming'
        WHEN marked_unable THEN 'Not coming - marked unable'
        ELSE 'Not selected'
    END AS status,
    additional_guests,
    CASE WHEN is_attending THEN 1 + additional_guest_count ELSE 0 END AS people_coming_for_event,
    phone,
    email,
    updated_at
FROM event_rows
ORDER BY sort_order, status, name;
