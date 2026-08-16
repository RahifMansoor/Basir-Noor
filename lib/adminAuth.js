export function isAdminAuthorized(request) {
    const expected = process.env.HUB_ADMIN_KEY;
    if (!expected) return false;
    const provided = request.headers.get("x-hub-admin-key");
    return provided === expected;
}
