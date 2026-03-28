const state = {
    activeSession: null,
    activeService: localStorage.getItem('mediconsult.activeService') || 'chat',
    currentImage: null,
    currentImagePreviewUrl: '',
    health: null,
    notifications: [],
    notificationStream: null,
    sessions: [],
    sessionSearch: '',
    theme: localStorage.getItem(window.STORAGE_KEYS.theme) || 'dark',
    language: localStorage.getItem(window.STORAGE_KEYS.language) || 'en',
    templates: {},
    user: null,
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    cacheTemplates();
    bindEvents();
    applyTheme(state.theme);
    applyLanguage(state.language);
    renderPromptGrid();
    renderNotifications();
    renderSessionList();
    renderActiveSession();

    await Promise.all([refreshHealth(), hydrateAuthConfig()]);
    await bootstrapUser();
    applyService(state.activeService);
    if (state.user) {
        await refreshSessions();
        connectNotificationStream();
    }
}

function cacheTemplates() {
    const welcome = document.getElementById('welcomeScreen');
    state.templates.welcome = welcome ? welcome.outerHTML : '';
}

function bindEvents() {
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        showToast('Theme updated', `Switched to ${state.theme} mode.`, 'success');
    });
    document.getElementById('languageSelect')?.addEventListener('change', (e) => applyLanguage(e.target.value));
    document.getElementById('notificationToggle')?.addEventListener('click', () => {
        document.getElementById('notificationPanel')?.classList.toggle('is-visible');
    });
    document.getElementById('clearNotificationsBtn')?.addEventListener('click', () => {
        state.notifications = [];
        renderNotifications();
    });
    document.getElementById('heroPrimaryBtn')?.addEventListener('click', enterWorkspace);
    document.getElementById('newChatBtn')?.addEventListener('click', createNewSession);
    document.getElementById('refreshSessionsBtn')?.addEventListener('click', refreshSessions);
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
    document.getElementById('chatHistory')?.addEventListener('click', onSessionListClick);
    document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
    document.getElementById('visionAnalyzeBtn')?.addEventListener('click', analyzeCurrentImage);
    document.getElementById('serviceTabs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-service]');
        if (btn) applyService(btn.dataset.service);
    });
    document.getElementById('exportChatBtn')?.addEventListener('click', exportCurrentSession);
    document.getElementById('analyzeImageBtn')?.addEventListener('click', analyzeCurrentImage);
    document.getElementById('removeImageBtn')?.addEventListener('click', clearImageSelection);
    document.getElementById('imageInput')?.addEventListener('change', onImageSelected);

    const searchInput = document.getElementById('sessionSearchInput');
    searchInput?.addEventListener('input', window.utils.debounce((e) => {
        state.sessionSearch = e.target.value || '';
        renderSessionList();
    }, 120));

    const textarea = document.getElementById('userInput');
    textarea?.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
    });
    textarea?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && state.activeService === 'chat') {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('quickPromptGrid')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-prompt]');
        if (btn && !requireAuth()) return;
        if (btn) {
            textarea.value = btn.dataset.prompt;
            textarea.focus();
        }
    });

    // Close notification panel on outside click
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notificationPanel');
        const toggle = document.getElementById('notificationToggle');
        if (panel && toggle && !panel.contains(e.target) && !toggle.contains(e.target)) {
            panel.classList.remove('is-visible');
        }
    });
}

function applyService(service) {
    if (!['chat', 'vision', 'history'].includes(service)) service = 'chat';
    if (!state.user && service !== 'chat') service = 'chat';
    
    state.activeService = service;
    localStorage.setItem('mediconsult.activeService', service);
    document.body.dataset.service = service;

    document.getElementById('visionPanel').hidden = service !== 'vision';
    document.getElementById('historyPanel').hidden = service !== 'history';

    document.querySelectorAll('#serviceTabs [data-service]').forEach(tab => {
        const active = tab.dataset.service === service;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active);
    });

    updateServiceHint();
    updateActionAvailability();
}

function updateServiceHint() {
    const hint = document.getElementById('serviceHint');
    if (!hint) return;
    if (!state.user) {
        hint.textContent = 'Sign in to start a consultation and save sessions.';
        return;
    }
    const hints = {
        chat: 'Ask a health question. Add an image if it helps.',
        vision: 'Upload an image and run analysis. Results save into the active session.',
        history: 'Use the left panel to search and open a saved session.',
    };
    hint.textContent = hints[service] || hints.chat;
}

function updateActionAvailability() {
    const authed = Boolean(state.user);
    document.getElementById('newChatBtn').disabled = !authed;
    document.getElementById('refreshSessionsBtn').disabled = !authed;
    document.getElementById('exportChatBtn').disabled = !authed || !state.activeSession?.id;
    document.getElementById('sendBtn').disabled = !authed;
    document.getElementById('analyzeImageBtn').disabled = !authed || !state.currentImage;
    document.getElementById('imageInput').disabled = !authed;
    document.getElementById('logoutBtn').hidden = !authed;
}

async function refreshHealth() {
    try {
        state.health = await window.api.getHealth();
    } catch (e) {
        state.health = null;
    }
}

async function hydrateAuthConfig() {
    try {
        state.authConfig = await window.api.getAuthConfig();
    } catch (e) {
        state.authConfig = null;
    }
}

async function bootstrapUser() {
    state.user = await window.auth.ensureSession();
    if (!state.user) {
        state.sessions = [];
        state.activeSession = null;
        state.notifications = [];
        document.getElementById('landingView').hidden = false;
        document.getElementById('appView').hidden = true;
    } else {
        document.getElementById('landingView').hidden = true;
        document.getElementById('appView').hidden = false;
        updateUserUI();
    }
    updateHeaderAuthLink();
    updateActionAvailability();
    renderSessionList();
    renderActiveSession();
    renderNotifications();
}

function updateHeaderAuthLink() {
    const link = document.getElementById('headerAuthLink');
    const userInfo = document.getElementById('headerUserInfo');
    if (link && userInfo) {
        link.style.display = state.user ? 'none' : 'inline-flex';
        userInfo.hidden = !state.user;
    }
}

function updateUserUI() {
    const name = state.user?.name || 'User';
    document.getElementById('userName').textContent = name;
    document.getElementById('userAvatar').textContent = initialsFromName(name);
}

function enterWorkspace() {
    if (state.user) {
        document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        redirectToLogin();
    }
}

function logoutUser() {
    state.notificationStream?.close();
    window.auth.logout({ redirect: false });
    state.user = null;
    state.sessions = [];
    state.activeSession = null;
    state.notifications = [];
    clearImageSelection();
    applyService('chat');
    document.getElementById('landingView').hidden = false;
    document.getElementById('appView').hidden = true;
    updateHeaderAuthLink();
    updateUserUI();
    renderSessionList();
    renderActiveSession();
    renderNotifications();
    showToast('Signed out', 'Your session has been cleared.', 'success');
}

function requireAuth() {
    if (state.user) return true;
    showToast('Sign in required', 'Create an account or sign in to use the workspace.', 'warning');
    setTimeout(redirectToLogin, 250);
    return false;
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

async function refreshSessions() {
    if (!state.user) return;
    try {
        const payload = await window.api.listSessions();
        state.sessions = payload.sessions || [];
        renderSessionList();
        if (!state.activeSession && state.sessions.length) {
            await loadSession(state.sessions[0].id);
        }
    } catch (e) {
        showToast('Could not load sessions', e.message, 'warning');
    }
}

async function createNewSession() {
    if (!requireAuth()) return;
    try {
        const session = await window.api.createSession('New consultation');
        state.sessions.unshift(session);
        state.activeSession = session;
        renderSessionList();
        renderActiveSession();
        document.getElementById('userInput')?.focus();
        showToast('New chat created', 'Start asking your health question.', 'success');
    } catch (e) {
        showToast('Could not create chat', e.message, 'warning');
    }
}

async function loadSession(sessionId) {
    if (!state.user) return;
    try {
        state.activeSession = await window.api.getSession(sessionId);
        renderSessionList();
        renderActiveSession();
    } catch (e) {
        showToast('Could not load session', e.message, 'warning');
    }
}

function onSessionListClick(e) {
    const deleteBtn = e.target.closest('[data-delete-session]');
    if (deleteBtn) {
        e.stopPropagation();
        const sessionId = Number(deleteBtn.dataset.deleteSession);
        const session = state.sessions.find(s => s.id === sessionId);
        confirmDelete(sessionId, session?.title || 'this chat');
        return;
    }
    const card = e.target.closest('[data-session-id]');
    if (card) loadSession(Number(card.dataset.sessionId));
}

function confirmDelete(sessionId, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    
    window.api.deleteSession(sessionId).then(() => {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        if (state.activeSession?.id === sessionId) state.activeSession = null;
        renderSessionList();
        renderActiveSession();
        showToast('Deleted', `"${title}" removed.`, 'success');
    }).catch(e => showToast('Delete failed', e.message, 'warning'));
}

function ensureActiveSessionStub() {
    if (!state.activeSession) {
        state.activeSession = {
            id: null,
            title: 'New consultation',
            messages: [],
            created_at: new Date().toISOString(),
        };
    }
}

async function sendMessage() {
    if (!requireAuth()) return;
    const input = document.getElementById('userInput');
    const query = input.value.trim();
    if (!query && !state.currentImage) return;

    ensureActiveSessionStub();
    
    const userMessage = {
        role: 'user',
        content: query || 'Image attached for consultation',
        timestamp: new Date().toISOString(),
        image_url: state.currentImagePreviewUrl || '',
    };
    
    state.activeSession.messages.push(userMessage);
    appendMessage(userMessage);
    input.value = '';
    input.style.height = 'auto';
    
    const typingId = appendTypingIndicator();

    try {
        const response = await window.api.sendMedicalQuery({
            query,
            image: state.currentImage,
            language: state.language,
            sessionId: state.activeSession.id,
        });
        
        removeTypingIndicator(typingId);
        
        const assistantMessage = {
            role: 'assistant',
            content: response.answer,
            confidence: response.confidence,
            confidence_reason: response.confidence_reason,
            sources: response.sources,
            timestamp: new Date().toISOString(),
        };
        
        state.activeSession.id = response.session_id;
        state.activeSession.title = response.session_title;
        state.activeSession.messages.push(assistantMessage);
        
        appendMessage(assistantMessage);
        syncSessionPreview(response.session_id, response.session_title, assistantMessage.content);
        updateSessionHeader();
        clearImageSelection();
        
    } catch (e) {
        removeTypingIndicator(typingId);
        const errorMsg = {
            role: 'system',
            content: e.message || 'Request failed. Please try again.',
            timestamp: new Date().toISOString(),
        };
        state.activeSession.messages.push(errorMsg);
        appendMessage(errorMsg);
        showToast('Failed', e.message, 'warning');
    }
}

async function analyzeCurrentImage() {
    if (!requireAuth()) return;
    if (!state.currentImage) {
        showToast('No image', 'Upload a medical image first.', 'warning');
        return;
    }
    ensureActiveSessionStub();
    
    const typingId = appendTypingIndicator('Analyzing image...');
    
    try {
        const analysis = await window.api.uploadImageForAnalysis(state.currentImage);
        const analysisMsg = { role: 'system', timestamp: new Date().toISOString(), analysis };
        state.activeSession.messages.push(analysisMsg);
        
        if (analysis.findings?.length > 0) {
            const labels = analysis.findings.map(f => f.label.replace(/_/g, ' ')).join(', ');
            const response = await window.api.sendMedicalQuery({
                query: `The vision analysis detected ${labels}. Explain this condition and how to treat it.`,
                image: null,
                language: state.language,
                sessionId: state.activeSession?.id,
            });
            
            removeTypingIndicator(typingId);
            
            const assistantMsg = {
                role: 'assistant',
                content: response.answer,
                confidence: response.confidence,
                sources: response.sources,
                timestamp: new Date().toISOString(),
            };
            
            state.activeSession.id = response.session_id;
            state.activeSession.title = response.session_title;
            state.activeSession.messages.push(assistantMsg);
            
            appendMessage(assistantMsg);
            syncSessionPreview(response.session_id, response.session_title, assistantMsg.content);
        } else {
            removeTypingIndicator(typingId);
        }
        
        updateSessionHeader();
        clearImageSelection();
        showToast('Analysis complete', 'Check the results above.', 'success');
        
    } catch (e) {
        removeTypingIndicator(typingId);
        showToast('Analysis failed', e.message, 'warning');
    }
}

function renderSessionList() {
    const container = document.getElementById('chatHistory');
    if (!container) return;
    
    if (!state.user) {
        container.innerHTML = '<div class="empty-state">Sign in to save your consultations.</div>';
        return;
    }

    let sessions = state.sessions;
    const query = state.sessionSearch?.trim().toLowerCase();
    
    if (query) {
        sessions = sessions.filter(s => 
            s.title?.toLowerCase().includes(query) || 
            s.last_message?.toLowerCase().includes(query)
        );
    }

    if (!sessions.length) {
        container.innerHTML = query 
            ? '<div class="empty-state">No results for "' + query + '"</div>'
            : '<div class="empty-state">No chats yet. Start one below!</div>';
        return;
    }

    const groups = groupSessions(sessions);
    container.innerHTML = groups.map(([label, items]) => `
        <div class="session-group-label">${label}</div>
        ${items.map(s => `
            <div class="session-item ${state.activeSession?.id === s.id ? 'is-active' : ''}" data-session-id="${s.id}">
                <div class="session-item__meta">
                    <span class="session-item__title">${escapeHtml(s.title || 'Untitled')}</span>
                    <button class="session-item__delete" data-delete-session="${s.id}" title="Delete">&times;</button>
                </div>
                <span class="session-item__snippet">${escapeHtml(s.last_message || 'No messages')}</span>
                <small>${formatRelTime(s.last_message_at || s.created_at)}</small>
            </div>
        `).join('')}
    `).join('');
}

function groupSessions(sessions) {
    const buckets = { Today: [], 'This week': [], 'This month': [], Older: [] };
    const now = Date.now();
    
    sessions.forEach(s => {
        const date = new Date(s.last_message_at || s.created_at);
        const days = (now - date.getTime()) / 86400000;
        let key = days < 1 ? 'Today' : days < 7 ? 'This week' : days < 30 ? 'This month' : 'Older';
        buckets[key].push(s);
    });
    
    return Object.entries(buckets).filter(([, v]) => v.length);
}

function renderActiveSession() {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    
    area.innerHTML = '';
    
    if (!state.user) {
        area.innerHTML = `
            <div class="welcome-card">
                <h3>Sign in to start</h3>
                <p>Create an account to save chats and get personalized help.</p>
                <a href="/login.html" class="btn btn-primary">Get Started</a>
            </div>
        `;
        return;
    }
    
    if (!state.activeSession?.messages?.length) {
        area.innerHTML = state.templates.welcome || getWelcomeTemplate();
        renderPromptGrid();
        updateSessionHeader();
        return;
    }
    
    area.innerHTML = state.activeSession.messages.map(renderMessageMarkup).join('');
    updateSessionHeader();
    area.scrollTop = area.scrollHeight;
}

function getWelcomeTemplate() {
    return `
        <div class="welcome-card" id="welcomeScreen">
            <h3>What can I help you with today?</h3>
            <p>Ask a health question or upload an image for analysis.</p>
            <div class="prompt-grid" id="quickPromptGrid"></div>
        </div>
    `;
}

function renderMessageMarkup(msg) {
    const role = msg.role === 'bot' ? 'assistant' : msg.role;
    const title = role === 'user' ? (state.user?.name || 'You') : role === 'system' ? 'System' : 'MediConsult AI';
    const imageHtml = msg.image_url ? `<div class="chat-message__image"><img src="${msg.image_url}" alt=""></div>` : '';
    
    if (msg.analysis) {
        const findings = msg.analysis.findings?.map(f => `
            <div class="ops-row">
                <strong>${escapeHtml(f.label)}</strong>
                <span>${Math.round(f.confidence * 100)}%</span>
            </div>
        `).join('') || '<div class="ops-row"><strong>No findings</strong></div>';
        
        return `
            <div class="chat-message chat-message--system">
                <div class="chat-message__bubble">
                    <div class="chat-message__header">
                        <span class="chat-message__title">Vision Analysis</span>
                    </div>
                    <div class="analysis-card">
                        <div class="ops-list">${findings}</div>
                        ${msg.analysis.annotated_image ? `<img src="data:image/png;base64,${msg.analysis.annotated_image}" alt="Annotated">` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    const confidenceHtml = msg.confidence ? `<span class="confidence-${getConfClass(msg.confidence)}">${getConfText(msg.confidence)}</span>` : '';
    const sourcesHtml = msg.sources?.length ? `
        <details class="sources-card">
            <summary>Sources (${msg.sources.length})</summary>
            ${msg.sources.map(s => `<div class="source-item"><strong>${escapeHtml(s.title)}</strong><span>${escapeHtml(s.snippet)}</span></div>`).join('')}
        </details>
    ` : '';
    
    return `
        <div class="chat-message chat-message--${role}">
            <div class="chat-message__bubble">
                <div class="chat-message__header">
                    <span class="chat-message__title">${escapeHtml(title)}</span>
                    <span class="chat-message__time">${formatTime(msg.timestamp)}</span>
                </div>
${confidenceHtml ? `<div class="chat-message__footer">${confidenceHtml}</div>` : ''}
                <div class="message-body">${markdownToHtml(msg.content || '')}</div>
                ${sourcesHtml}
                ${imageHtml}
            </div>
        </div>
    `;
}

function appendMessage(msg) {
    const area = document.getElementById('messagesArea');
    if (area.querySelector('.welcome-card')) area.innerHTML = '';
    area.insertAdjacentHTML('beforeend', renderMessageMarkup(msg));
    area.scrollTop = area.scrollHeight;
}

function appendTypingIndicator(label = 'Thinking') {
    const area = document.getElementById('messagesArea');
    const id = 'typing-' + Date.now();
    if (area.querySelector('.welcome-card')) area.innerHTML = '';
    area.insertAdjacentHTML('beforeend', `
        <div class="chat-message chat-message--assistant" id="${id}">
            <div class="chat-message__bubble">
                <span>${escapeHtml(label)}</span>
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        </div>
    `);
    area.scrollTop = area.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
}

function onImageSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!window.utils.validateImageFile(file)) {
        showToast('Invalid file', 'Use JPG, PNG, or WEBP under 5MB.', 'warning');
        e.target.value = '';
        return;
    }
    
    // Clean up previous URL
    if (state.currentImagePreviewUrl) URL.revokeObjectURL(state.currentImagePreviewUrl);
    
    state.currentImage = file;
    state.currentImagePreviewUrl = URL.createObjectURL(file);
    
    document.getElementById('imagePreviewWrapper').hidden = false;
    document.getElementById('imagePreview').src = state.currentImagePreviewUrl;
    document.getElementById('imagePreviewName').textContent = file.name;
    document.getElementById('imagePreviewSize').textContent = window.utils.formatFileSize(file.size);
    updateActionAvailability();
}

function clearImageSelection() {
    if (state.currentImagePreviewUrl) URL.revokeObjectURL(state.currentImagePreviewUrl);
    state.currentImage = null;
    state.currentImagePreviewUrl = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreviewWrapper').hidden = true;
    updateActionAvailability();
}

function renderPromptGrid() {
    const grid = document.getElementById('quickPromptGrid');
    if (!grid) return;
    const prompts = window.QUICK_PROMPTS?.[state.language] || window.QUICK_PROMPTS?.en || [];
    grid.innerHTML = prompts.map(p => `
        <button class="prompt-button" data-prompt="${escapeHtml(p)}">${escapeHtml(p)}</button>
    `).join('');
}

function updateSessionHeader() {
    const title = state.activeSession?.title || 'New conversation';
    document.getElementById('activeSessionTitle').textContent = title;
    const ts = document.getElementById('activeSessionTimestamp');
    if (ts) ts.textContent = state.activeSession?.messages?.length ? '' : 'Waiting...';
    updateActionAvailability();
}

function connectNotificationStream() {
    state.notificationStream?.close();
    const token = localStorage.getItem(window.STORAGE_KEYS.token);
    if (!token || !state.user) return;
    
    try {
        state.notificationStream = new EventSource(window.api.getNotificationStreamUrl());
        state.notificationStream.addEventListener('notification', (e) => {
            const payload = JSON.parse(e.data);
            state.notifications.unshift(payload);
            state.notifications = state.notifications.slice(0, 20);
            renderNotifications();
            if (payload.category !== 'connection') {
                showToast(payload.title, payload.message, payload.severity || 'success');
            }
        });
        state.notificationStream.onerror = () => {
            state.notificationStream?.close();
            state.notificationStream = null;
        };
    } catch (e) {
        console.error('Notification stream error:', e);
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    badge.textContent = state.notifications.length;
    badge.style.display = state.notifications.length ? 'grid' : 'none';
    
    if (!state.notifications.length) {
        list.innerHTML = '<div class="empty-state">No notifications yet.</div>';
        return;
    }
    
    list.innerHTML = state.notifications.map(n => `
        <div class="notification-item notification-item--${n.severity || 'info'}">
            <strong>${escapeHtml(n.title)}</strong>
            <p>${escapeHtml(n.message)}</p>
            <small>${formatRelTime(n.created_at)}</small>
        </div>
    `).join('');
}

function exportCurrentSession() {
    if (!requireAuth()) return;
    if (!state.activeSession?.messages?.length) {
        showToast('Nothing to export', 'Start a conversation first.', 'warning');
        return;
    }
    
    const content = [
        `# ${state.activeSession.title}`,
        '',
        ...state.activeSession.messages.map(m => {
            const role = m.role === 'assistant' ? 'Assistant' : m.role === 'user' ? 'User' : 'System';
            return `## ${role}\n${m.content || JSON.stringify(m.analysis)}\n`;
        }),
    ].join('\n');
    
    window.utils.downloadFile(
        (state.activeSession.title || 'consultation').replace(/\s+/g, '-').toLowerCase() + '.md',
        content
    );
    showToast('Exported', 'Check your downloads.', 'success');
}

function applyTheme(theme) {
    state.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem(window.STORAGE_KEYS.theme, theme);
}

function applyLanguage(language) {
    state.language = language;
    localStorage.setItem(window.STORAGE_KEYS.language, language);
    document.documentElement.lang = language;
    const select = document.getElementById('languageSelect');
    if (select) select.value = language;
    renderPromptGrid();
}

function showToast(title, message, severity = 'success') {
    const stack = document.getElementById('toastStack');
    const toast = document.createElement('div');
    toast.className = `toast toast--${severity}`;
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function syncSessionPreview(id, title, lastMessage) {
    let session = state.sessions.find(s => s.id === id);
    if (session) {
        Object.assign(session, { title, last_message: lastMessage, last_message_at: new Date().toISOString() });
    } else {
        state.sessions.unshift({ id, title, last_message: lastMessage, last_message_at: new Date().toISOString() });
    }
    renderSessionList();
}

// Helpers
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelTime(ts) {
    if (!ts) return 'Just now';
    const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
}

function markdownToHtml(md) {
    const h = escapeHtml(md || '');
    return h
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

function getConfClass(level) {
    if (level >= 0.8) return 'high';
    if (level >= 0.5) return 'medium';
    if (level >= 0.3) return 'low';
    return 'none';
}

function getConfText(level) {
    if (level >= 0.8) return 'High confidence';
    if (level >= 0.5) return 'Medium confidence';
    if (level >= 0.3) return 'Low confidence';
    return 'Uncertain';
}

function initialsFromName(name) {
    return (name || 'GU').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
