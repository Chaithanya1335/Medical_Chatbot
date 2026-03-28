const baseUrl =
    window.location.protocol === 'file:'
        ? 'http://localhost:8000'
        : window.location.origin;

const API_CONFIG = {
    BASE_URL: baseUrl,
    TIMEOUT: 45000,
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ENDPOINTS: {
        HEALTH: '/api/v1/health',
        SHOWCASE: '/api/v1/showcase/overview',
        AUTH_CONFIG: '/api/v1/auth/config',
        AUTH_LOGIN: '/api/v1/auth/login',
        AUTH_REGISTER: '/api/v1/auth/register',
        AUTH_DEMO: '/api/v1/auth/demo',
        AUTH_ME: '/api/v1/auth/me',
        MEDICAL_QUERY: '/api/v1/medical-query',
        IMAGE_ANALYSIS: '/api/v1/upload-image',
        SESSIONS: '/api/v1/sessions',
        NOTIFICATIONS: '/api/v1/notifications/stream',
    },
};

const CONFIDENCE_LEVELS = {
    HIGH: { color: '#0f766e', text: 'High confidence' },
    MEDIUM: { color: '#f59e0b', text: 'Moderate confidence' },
    LOW: { color: '#f97316', text: 'Low confidence' },
    NONE: { color: '#64748b', text: 'No confidence rating' },
};

const LANGUAGE_MAP = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
};

const STORAGE_KEYS = {
    token: 'mediconsult_token',
    user: 'mediconsult_user',
    theme: 'mediconsult_theme',
    language: 'mediconsult_language',
};

window.API_CONFIG = API_CONFIG;
window.CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
window.LANGUAGE_MAP = LANGUAGE_MAP;
window.STORAGE_KEYS = STORAGE_KEYS;
