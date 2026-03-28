function getAuthHeaders() {
    const token = localStorage.getItem(window.STORAGE_KEYS.token);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), window.API_CONFIG.TIMEOUT);

    try {
        const response = await fetch(`${window.API_CONFIG.BASE_URL}${path}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...(options.headers || {}),
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.detail || 'Request failed');
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function getHealth() {
    return apiRequest(window.API_CONFIG.ENDPOINTS.HEALTH);
}

async function getShowcaseOverview() {
    return apiRequest(window.API_CONFIG.ENDPOINTS.SHOWCASE);
}

async function getAuthConfig() {
    return apiRequest(window.API_CONFIG.ENDPOINTS.AUTH_CONFIG);
}

async function registerLocal({ fullName, email, password }) {
    return apiRequest(window.API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            full_name: fullName,
            email,
            password,
        }),
    });
}

async function loginLocal({ email, password }) {
    return apiRequest(window.API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
}

async function authenticateDemo(displayName = 'Demo Clinician') {
    return apiRequest(window.API_CONFIG.ENDPOINTS.AUTH_DEMO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
    });
}

async function authenticateGoogle(token) {
    return apiRequest('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
}

async function getCurrentUser() {
    return apiRequest(window.API_CONFIG.ENDPOINTS.AUTH_ME);
}

async function listSessions() {
    return apiRequest(window.API_CONFIG.ENDPOINTS.SESSIONS);
}

async function getSession(sessionId) {
    return apiRequest(`${window.API_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`);
}

async function createSession(title = 'New consultation') {
    return apiRequest(window.API_CONFIG.ENDPOINTS.SESSIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
}

async function deleteSession(sessionId) {
    return apiRequest(`${window.API_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, {
        method: 'DELETE',
    });
}

async function sendMedicalQuery({ query, image, language, sessionId }) {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);
    if (image) formData.append('image', image);

    return apiRequest(window.API_CONFIG.ENDPOINTS.MEDICAL_QUERY, {
        method: 'POST',
        body: formData,
    });
}

async function uploadImageForAnalysis(image) {
    const formData = new FormData();
    formData.append('image', image);

    return apiRequest(window.API_CONFIG.ENDPOINTS.IMAGE_ANALYSIS, {
        method: 'POST',
        body: formData,
    });
}

function getNotificationStreamUrl() {
    const token = localStorage.getItem(window.STORAGE_KEYS.token);
    const url = new URL(
        `${window.API_CONFIG.BASE_URL}${window.API_CONFIG.ENDPOINTS.NOTIFICATIONS}`,
    );
    url.searchParams.set('token', token || '');
    return url.toString();
}

window.api = {
    authenticateDemo,
    authenticateGoogle,
    createSession,
    deleteSession,
    getAuthConfig,
    getCurrentUser,
    getHealth,
    getNotificationStreamUrl,
    getSession,
    getShowcaseOverview,
    loginLocal,
    listSessions,
    registerLocal,
    sendMedicalQuery,
    uploadImageForAnalysis,
};
