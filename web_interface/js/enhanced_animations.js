// Enhanced Animations and UX for MediConsult AI
// Adds smooth transitions, scroll effects, and interactive enhancements

(function() {
    'use strict';

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .step-card, .rail-card');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
            scrollObserver.observe(el);
        });
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (!themeToggle) return;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('mediconsult_theme') || 'dark';
        document.body.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.dataset.theme;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.dataset.theme = newTheme;
            localStorage.setItem('mediconsult_theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Show toast notification
            window.showToast('Theme updated', `Switched to ${newTheme} mode`, 'success');
        });
    }

    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    function showToastEnhanced(title, message, type = 'success', duration = 4000) {
        const toastStack = document.getElementById('toastStack');
        if (!toastStack) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div>
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        toastStack.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            requestAnimationFrame(() => {
                toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
            });
        });

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            closeToast(toast);
        });

        // Auto dismiss
        setTimeout(() => closeToast(toast), duration);
    }

    function closeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }

    // Enhance existing showToast if available, otherwise define it
    const originalShowToast = window.showToast;
    
    window.showToast = function(title, message, severity = 'success', duration = 4000) {
        // If enhanced toast with animation is desired, use our version
        if (document.getElementById('toastStack')) {
            showToastEnhanced(title, message, severity, duration);
        } else if (originalShowToast) {
            // Fall back to original
            originalShowToast(title, message, severity);
        }
    };

    // ============================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================
    function initRippleEffect() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // Add ripple keyframes to document
    const rippleStyles = document.createElement('style');
    rippleStyles.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyles);

    // ============================================
    // TYPING EFFECT FOR HERO TEXT
    // ============================================
    function initTypingEffect() {
        const heroTitle = document.querySelector('.hero h1');
        if (!heroTitle) return;

        const originalText = heroTitle.innerHTML;
        const spanMatch = originalText.match(/<span>(.*?)<\/span>/);
        if (!spanMatch) return;

        const spanText = spanMatch[1];
        const beforeSpan = originalText.split('<span>')[0];
        const afterSpan = originalText.split('</span>')[1];

        heroTitle.innerHTML = beforeSpan + '<span class="typing-text"></span>' + afterSpan;

        const typingSpan = heroTitle.querySelector('.typing-text');
        let charIndex = 0;

        function typeChar() {
            if (charIndex < spanText.length) {
                typingSpan.textContent += spanText[charIndex];
                charIndex++;
                setTimeout(typeChar, 100);
            } else {
                typingSpan.style.borderRight = 'none';
            }
        }

        // Start typing after initial animation
        setTimeout(typeChar, 800);
    }

    // ============================================
    // PARALLAX EFFECT FOR HERO
    // ============================================
    function initParallaxEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const parallaxSpeed = 0.5;
                    hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // INPUT FOCUS EFFECTS
    // ============================================
    function initInputEffects() {
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement?.classList.add('is-focused');
            });

            input.addEventListener('blur', function() {
                this.parentElement?.classList.remove('is-focused');
            });
        });
    }

    // ============================================
    // CARD HOVER 3D EFFECT
    // ============================================
    function initCardHoverEffect() {
        document.querySelectorAll('.feature-card, .step-card').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ============================================
    // LOADING INDICATOR ENHANCEMENT
    // ============================================
    function enhanceLoadingIndicators() {
        // Override the existing typing indicator with enhanced version
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 12px 16px;
                background: var(--bg-elevated);
                border-radius: var(--radius-lg);
                border: 1px solid var(--border-subtle);
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--accent-primary), var(--blue-500));
                animation: typingBounce 1.4s infinite ease-in-out both;
            }

            .typing-indicator span:nth-child(1) {
                animation-delay: -0.32s;
            }

            .typing-indicator span:nth-child(2) {
                animation-delay: -0.16s;
            }

            @keyframes typingBounce {
                0%, 80%, 100% {
                    transform: scale(0.6);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .message-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 0;
                color: var(--text-secondary);
                font-size: 0.875rem;
            }

            .message-loading::before {
                content: '';
                width: 16px;
                height: 16px;
                border: 2px solid var(--border-default);
                border-top-color: var(--accent-primary);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // NOTIFICATION ANIMATIONS
    // ============================================
    function initNotificationAnimations() {
        const notificationToggle = document.getElementById('notificationToggle');
        const notificationPanel = document.getElementById('notificationPanel');

        if (notificationToggle && notificationPanel) {
            notificationToggle.addEventListener('click', () => {
                const isVisible = notificationPanel.classList.contains('is-visible');
                
                if (!isVisible) {
                    notificationPanel.style.transform = 'translateY(-10px) scale(0.95)';
                    notificationPanel.style.opacity = '0';
                    
                    requestAnimationFrame(() => {
                        notificationPanel.classList.add('is-visible');
                        notificationPanel.style.transform = 'translateY(0) scale(1)';
                        notificationPanel.style.opacity = '1';
                    });
                } else {
                    notificationPanel.style.transform = 'translateY(-10px) scale(0.95)';
                    notificationPanel.style.opacity = '0';
                    
                    setTimeout(() => {
                        notificationPanel.classList.remove('is-visible');
                    }, 200);
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!notificationToggle.contains(e.target) && 
                    !notificationPanel.contains(e.target) &&
                    notificationPanel.classList.contains('is-visible')) {
                    notificationPanel.style.transform = 'translateY(-10px) scale(0.95)';
                    notificationPanel.style.opacity = '0';
                    setTimeout(() => {
                        notificationPanel.classList.remove('is-visible');
                    }, 200);
                }
            });
        }
    }

    // ============================================
    // PROGRESSIVE ENHANCEMENT FOR FORMS
    // ============================================
    function initFormEnhancements() {
        document.querySelectorAll('form').forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                // Floating label effect
                input.addEventListener('focus', function() {
                    this.parentElement?.classList.add('is-active');
                });

                input.addEventListener('blur', function() {
                    if (!this.value) {
                        this.parentElement?.classList.remove('is-active');
                    }
                });

                // Real-time validation feedback
                input.addEventListener('input', function() {
                    validateInput(this);
                });
            });
        });
    }

    function validateInput(input) {
        const isValid = input.checkValidity();
        input.style.borderColor = isValid ? 'var(--border-default)' : 'var(--color-error)';
        
        if (input.value && isValid) {
            input.style.borderColor = 'var(--color-success)';
        }
    }

    // ============================================
    // CHAT MESSAGE ANIMATIONS
    // ============================================
    function initChatAnimations() {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        // Observe new messages being added
        const messageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('chat-message')) {
                        animateMessage(node);
                    }
                });
            });
        });

        messageObserver.observe(messagesArea, { childList: true });
    }

    function animateMessage(message) {
        message.style.opacity = '0';
        message.style.transform = message.classList.contains('chat-message--user') 
            ? 'translateX(20px)' 
            : 'translateX(-20px)';

        requestAnimationFrame(() => {
            message.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            message.style.opacity = '1';
            message.style.transform = 'translateX(0)';
        });
    }

    // ============================================
    // NAVIGATION HIGHLIGHTING
    // ============================================
    function initNavigationHighlighting() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('a[href^="#"]');

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    let current = '';
                    
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        const sectionHeight = section.clientHeight;
                        if (pageYOffset >= sectionTop - 200) {
                            current = section.getAttribute('id');
                        }
                    });

                    navLinks.forEach(link => {
                        link.classList.remove('is-active');
                        if (link.getAttribute('href') === `#${current}`) {
                            link.classList.add('is-active');
                        }
                    });

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================
    function initPerformanceOptimizations() {
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                // Scroll-based updates
            });
        }, { passive: true });

        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runInit);
        } else {
            runInit();
        }
    }

    function runInit() {
        initScrollAnimations();
        initThemeToggle();
        initSmoothScroll();
        initRippleEffect();
        initTypingEffect();
        initParallaxEffect();
        initInputEffects();
        initCardHoverEffect();
        enhanceLoadingIndicators();
        initNotificationAnimations();
        initFormEnhancements();
        initChatAnimations();
        initNavigationHighlighting();
        initPerformanceOptimizations();

        console.log('✨ MediConsult AI Enhanced UI initialized');
    }

    // Start initialization
    init();
})();
