function readStoredUser() {
    const raw = localStorage.getItem(window.STORAGE_KEYS.user);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem(window.STORAGE_KEYS.user);
        return null;
    }
}

function persistSession(payload) {
    localStorage.setItem(window.STORAGE_KEYS.token, payload.access_token);
    localStorage.setItem(window.STORAGE_KEYS.user, JSON.stringify(payload.user));
    return payload.user;
}

function clearSession() {
    localStorage.removeItem(window.STORAGE_KEYS.token);
    localStorage.removeItem(window.STORAGE_KEYS.user);
}

async function ensureSession(options = {}) {
    const storedToken = localStorage.getItem(window.STORAGE_KEYS.token);
    if (!storedToken) return null;

    if (options.force) {
        clearSession();
        return null;
    }

    try {
        const user = await window.api.getCurrentUser();
        localStorage.setItem(window.STORAGE_KEYS.user, JSON.stringify(user));
        return user;
    } catch (error) {
        clearSession();
        return null;
    }
}

async function loginLocal(credentials) {
    const payload = await window.api.loginLocal(credentials);
    return persistSession(payload);
}

async function registerLocal(details) {
    const payload = await window.api.registerLocal(details);
    return persistSession(payload);
}

async function loginDemo(displayName = 'Guest Reviewer') {
    const payload = await window.api.authenticateDemo(displayName);
    return persistSession(payload);
}

function logout(options = {}) {
    clearSession();
    if (options.redirect !== false) {
        window.location.href = '/login.html';
    }
}

window.auth = {
    clearSession,
    ensureSession,
    loginDemo,
    loginLocal,
    logout,
    persistSession,
    readStoredUser,
    registerLocal,
};
