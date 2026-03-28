function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function uid(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;
}

function formatTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(value) {
    if (!value) return 'Just now';
    const date = value instanceof Date ? value : new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes <= 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
}

function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateImageFile(file) {
    if (!(file instanceof File)) return false;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return validTypes.includes(file.type) && file.size <= window.API_CONFIG.MAX_FILE_SIZE;
}

function getConfidenceClass(level) {
    const key = String(level || 'NONE').toUpperCase();
    return `confidence-${key.toLowerCase()}`;
}

function getConfidenceText(level) {
    const key = String(level || 'NONE').toUpperCase();
    return window.CONFIDENCE_LEVELS[key]?.text || 'Confidence pending';
}

function debounce(callback, wait = 120) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), wait);
    };
}

function markdownToHtml(markdown) {
    const safe = escapeHtml(markdown || '');
    const withCode = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
    const withBold = withCode.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const withBullets = withBold.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
    const wrappedLists = withBullets.replace(/(?:<li>.*<\/li>\s*)+/g, (match) => `<ul>${match}</ul>`);
    const withParagraphs = wrappedLists
        .split(/\n{2,}/)
        .map((block) => {
            if (block.includes('<ul>') || block.startsWith('<')) return block;
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');

    return withParagraphs || '<p>No response available.</p>';
}

function downloadFile(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

window.utils = {
    debounce,
    downloadFile,
    escapeHtml,
    formatFileSize,
    formatRelativeTime,
    formatTime,
    getConfidenceClass,
    getConfidenceText,
    markdownToHtml,
    uid,
    validateImageFile,
};
