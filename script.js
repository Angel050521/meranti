/* ===============================================
   MERANTI RESTAURANTE - JavaScript
   Premium Interactions & Animations
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initPreloader();
    initNavigation();
    initScrollEffects();
    initMenuTabs();
    initReservationForm();
    initParticles();
    initScrollAnimations();
    initMapLazyLoad();
});

/* ===============================================
   PRELOADER
   =============================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'visible';
        }, 2000);
    });
}

/* ===============================================
   NAVIGATION
   =============================================== */
function initNavigation() {
    const header = document.getElementById('header');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav-link');

    // Header scroll effect
    function handleScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'visible';
        });
    }

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'visible';

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active link on scroll - OPTIMIZADO para evitar reflow
    const sections = document.querySelectorAll('section[id]');

    // Cache de dimensiones para evitar reflow forzado
    let sectionData = [];
    let lastWidth = 0;

    function cacheSectionDimensions() {
        const currentWidth = window.innerWidth;
        // Solo recalcular si cambió el viewport (resize)
        if (currentWidth !== lastWidth || sectionData.length === 0) {
            lastWidth = currentWidth;
            sectionData = Array.from(sections).map(section => ({
                id: section.getAttribute('id'),
                top: section.offsetTop - 150,
                height: section.offsetHeight
            }));
        }
    }

    // Cachear dimensiones inicialmente y en resize
    cacheSectionDimensions();
    window.addEventListener('resize', debounce(cacheSectionDimensions, 250));

    function updateActiveLink() {
        const scrollY = window.scrollY;

        sectionData.forEach(({ id, top, height }) => {
            if (scrollY > top && scrollY <= top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', throttle(updateActiveLink, 100));
}

/* ===============================================
   SCROLL EFFECTS
   =============================================== */
function initScrollEffects() {
    const backToTop = document.getElementById('backToTop');

    // Back to top button visibility
    function handleBackToTop() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', throttle(handleBackToTop, 100));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ===============================================
   MENU TABS
   =============================================== */
function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    const panels = document.querySelectorAll('.menu-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Initialize dish lightbox
    initDishLightbox();
}

function initDishLightbox() {
    const menuItems = document.querySelectorAll('.menu-item');

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'dish-lightbox';
    lightbox.id = 'dish-lightbox';
    lightbox.innerHTML = `
        <div class="dish-lightbox-overlay"></div>
        <div class="dish-lightbox-content">
            <button class="dish-lightbox-close" aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="dish-lightbox-image">
                <img src="" alt="" id="dish-lightbox-img">
                <div class="dish-lightbox-placeholder" id="dish-lightbox-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Imagen próximamente</span>
                </div>
            </div>
            <div class="dish-lightbox-info">
                <div class="dish-lightbox-badge" id="dish-lightbox-badge" style="display: none;"></div>
                <div class="dish-lightbox-header">
                    <h3 class="dish-lightbox-title" id="dish-lightbox-title"></h3>
                    <span class="dish-lightbox-price" id="dish-lightbox-price"></span>
                </div>
                <p class="dish-lightbox-description" id="dish-lightbox-description"></p>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);

    // Get lightbox elements
    const lightboxImg = document.getElementById('dish-lightbox-img');
    const lightboxPlaceholder = document.getElementById('dish-lightbox-placeholder');
    const lightboxTitle = document.getElementById('dish-lightbox-title');
    const lightboxPrice = document.getElementById('dish-lightbox-price');
    const lightboxDescription = document.getElementById('dish-lightbox-description');
    const lightboxBadge = document.getElementById('dish-lightbox-badge');
    const lightboxClose = lightbox.querySelector('.dish-lightbox-close');
    const lightboxOverlay = lightbox.querySelector('.dish-lightbox-overlay');
    const lightboxContent = lightbox.querySelector('.dish-lightbox-content');

    // Open lightbox function
    function openLightbox(item) {
        const title = item.querySelector('.menu-item-title')?.textContent || '';
        const price = item.querySelector('.menu-item-price')?.textContent || '';
        const description = item.querySelector('.menu-item-description')?.textContent || '';
        const badge = item.querySelector('.menu-item-badge')?.textContent || '';
        const imageSrc = item.dataset.image || '';

        // Set content
        lightboxTitle.textContent = title;
        lightboxPrice.textContent = price;
        lightboxDescription.textContent = description;

        // Handle badge
        if (badge) {
            lightboxBadge.textContent = badge;
            lightboxBadge.style.display = 'inline-block';
        } else {
            lightboxBadge.style.display = 'none';
        }

        // Handle image
        if (imageSrc) {
            lightboxImg.src = imageSrc;
            lightboxImg.alt = title;
            lightboxImg.style.display = 'block';
            lightboxPlaceholder.style.display = 'none';
        } else {
            lightboxImg.style.display = 'none';
            lightboxPlaceholder.style.display = 'flex';
        }

        // Show lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close lightbox function
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'visible';
    }

    // Add click handlers to menu items
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent if clicking a link inside the item
            if (e.target.closest('a')) return;
            openLightbox(item);
        });

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Ver imagen del platillo');

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(item);
            }
        });
    });

    // Close handlers
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Touch swipe to close on mobile
    let touchStartY = 0;
    let touchEndY = 0;

    lightboxContent.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightboxContent.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        const swipeDistance = touchEndY - touchStartY;

        // If swiped down more than 100px, close
        if (swipeDistance > 100) {
            closeLightbox();
        }
    }, { passive: true });
}

/* ===============================================
   RESERVATION FORM - WhatsApp Integration
   =============================================== */
function initReservationForm() {
    const form = document.getElementById('reservation-form');
    const WHATSAPP_NUMBER = '5214531582078';

    if (form) {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Modal functionality for tables map
        const btnViewTables = document.getElementById('btn-view-tables');
        const tablesModal = document.getElementById('tables-modal');
        const modalClose = document.getElementById('modal-close');

        if (btnViewTables && tablesModal) {
            btnViewTables.addEventListener('click', () => {
                tablesModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            const closeModal = () => {
                tablesModal.classList.remove('active');
                document.body.style.overflow = '';
            };

            if (modalClose) {
                modalClose.addEventListener('click', closeModal);
            }

            tablesModal.addEventListener('click', (e) => {
                if (e.target === tablesModal) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && tablesModal.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Get form data (with new time and table fields)
            const timeHour = document.getElementById('time-hour').value;
            const timeMinutes = document.getElementById('time-minutes').value;
            const mesaSelect = document.getElementById('mesa');

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                guests: document.getElementById('guests').value,
                date: document.getElementById('date').value,
                timeHour: timeHour,
                timeMinutes: timeMinutes,
                mesa: mesaSelect ? mesaSelect.value : '',
                mesaText: mesaSelect && mesaSelect.value ? mesaSelect.options[mesaSelect.selectedIndex].text : '',
                message: document.getElementById('message').value
            };

            // Format date for display
            const dateObj = new Date(formData.date + 'T00:00:00');
            const dateFormatted = dateObj.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Format time for display (combining hour and minutes)
            const timeString = `${formData.timeHour}:${formData.timeMinutes}`;
            const timeFormatted = new Date('1970-01-01T' + timeString + ':00').toLocaleTimeString('es-MX', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            // Build WhatsApp message
            let whatsappMessage = `*NUEVA RESERVACION - MERANTI RESTAURANTE*\n\n`;
            whatsappMessage += `- *Nombre:* ${formData.name}\n`;
            if (formData.email.trim()) {
                whatsappMessage += `- *Email:* ${formData.email}\n`;
            }
            whatsappMessage += `- *Telefono:* ${formData.phone}\n`;
            whatsappMessage += `- *Personas:* ${formData.guests}\n`;
            whatsappMessage += `- *Fecha:* ${dateFormatted}\n`;
            whatsappMessage += `- *Hora:* ${timeFormatted}\n`;

            // Add table preference if selected
            if (formData.mesa && formData.mesaText) {
                whatsappMessage += `- *Mesa preferida:* ${formData.mesaText}\n`;
            }

            if (formData.message.trim()) {
                whatsappMessage += `\n*Peticiones especiales:*\n${formData.message}\n`;
            }

            whatsappMessage += `\n_Enviado desde merantirestaurante.com_`;

            // Encode message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            // Show loading state
            submitBtn.innerHTML = `
                <span>Abriendo WhatsApp...</span>
                <svg class="spinning" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
            `;
            submitBtn.disabled = true;

            // Small delay for user feedback
            await new Promise(resolve => setTimeout(resolve, 800));

            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // Show success state
            submitBtn.innerHTML = `
                <span>¡WhatsApp Abierto!</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';

            // Reset form after delay
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 4000);
        });
    }
}


/* ===============================================
   PARTICLES EFFECT
   =============================================== */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(218, 166, 63, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
    `;

    container.appendChild(particle);
}

// Add float animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
    
    @keyframes spinning {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .spinning {
        animation: spinning 1s linear infinite;
    }
`;
document.head.appendChild(styleSheet);

/* ===============================================
   SCROLL ANIMATIONS (Intersection Observer) - OPTIMIZADO
   =============================================== */
function initScrollAnimations() {
    // Elementos principales (pocos, pueden tener animación individual)
    const mainElements = document.querySelectorAll(
        '.about-content, .about-images, .reservations-info, .reservation-form'
    );

    // Elementos de grid (muchos, animación por grupo)
    const gridElements = document.querySelectorAll(
        '.specialty-card, .menu-item, .gallery-item'
    );

    const observerOptions = {
        root: null,
        rootMargin: '50px', // Pre-carga antes de que sean visibles
        threshold: 0.05     // Menos threshold para activar más rápido
    };

    // Observer para elementos principales
    const mainObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                mainObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer para grids - con batch animation
    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                gridObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aplicar clases iniciales a elementos principales
    mainElements.forEach((el, index) => {
        el.classList.add('animate-ready');
        el.style.transitionDelay = `${Math.min(index * 0.1, 0.3)}s`;
        mainObserver.observe(el);
    });

    // Aplicar clases iniciales a elementos de grid con delay limitado
    gridElements.forEach((el, index) => {
        el.classList.add('animate-ready');
        // Delay máximo de 0.3s, reinicia cada 6 elementos (una fila típica)
        const rowIndex = index % 6;
        el.style.transitionDelay = `${rowIndex * 0.05}s`;
        gridObserver.observe(el);
    });
}

// Agregar estilos de animación optimizados
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
        will-change: opacity, transform;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    /* Desactivar animaciones si el usuario prefiere reducir movimiento */
    @media (prefers-reduced-motion: reduce) {
        .animate-ready {
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
`;
document.head.appendChild(animationStyles);

/* ===============================================
   UTILITY FUNCTIONS
   =============================================== */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ===============================================
   GALLERY LIGHTBOX (Optional Enhancement)
   =============================================== */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;

            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-content">
                    <img src="${img.src}" alt="${img.alt}">
                    <button class="lightbox-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;

            // Add lightbox styles
            const styles = `
                .lightbox {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }
                .lightbox-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.95);
                }
                .lightbox-content {
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                }
                .lightbox-content img {
                    max-width: 100%;
                    max-height: 90vh;
                    object-fit: contain;
                    border-radius: 8px;
                }
                .lightbox-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    color: white;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                }
            `;

            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            lightbox.appendChild(styleEl);

            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';

            // Close handlers
            const close = () => {
                lightbox.remove();
                document.body.style.overflow = 'visible';
            };

            lightbox.querySelector('.lightbox-overlay').addEventListener('click', close);
            lightbox.querySelector('.lightbox-close').addEventListener('click', close);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') close();
            }, { once: true });
        });
    });
}

// Initialize lightbox after DOM loads
document.addEventListener('DOMContentLoaded', initGalleryLightbox);

/* ===============================================
   HEADER PARALLAX EFFECT
   =============================================== */
function initHeroParallax() {
    const hero = document.querySelector('.hero');

    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initHeroParallax);

/* ===============================================
   COUNTER ANIMATION
   =============================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.textContent);
                animateCounter(target, 0, endValue, 2000);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const suffix = element.textContent.replace(/[0-9]/g, '');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (end - start) + start);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', initCounterAnimation);

/* ===============================================
   FORM VALIDATION ENHANCEMENTS
   =============================================== */
function initFormValidation() {
    const inputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');

    // Remove existing error state
    field.classList.remove('error');

    if (isRequired && !value) {
        field.classList.add('error');
        return false;
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('error');
            return false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            field.classList.add('error');
            return false;
        }
    }

    return true;
}

document.addEventListener('DOMContentLoaded', initFormValidation);

// Add error styles
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #e74c3c !important;
        background: rgba(231, 76, 60, 0.1);
    }
`;
document.head.appendChild(errorStyles);

/* ===============================================
   NEWSLETTER FORM
   =============================================== */
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const input = newsletterForm.querySelector('input');
            const button = newsletterForm.querySelector('button');
            const email = input.value.trim();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                input.style.borderColor = '#e74c3c';
                return;
            }

            input.style.borderColor = '';
            button.innerHTML = '✓';

            setTimeout(() => {
                input.value = '';
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                `;
            }, 2000);
        });
    }
});


function initMapLazyLoad() {
    const mapContainer = document.getElementById('map-container');
    const mapFacade = document.getElementById('map-facade');
    const loadBtn = mapContainer?.querySelector('.map-load-btn');

    if (!loadBtn || !mapFacade || !mapContainer) return;

    loadBtn.addEventListener('click', () => {
        // Add loading state
        mapContainer.classList.add('loading');

        // Create the iframe
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.635366437916!2d-102.35660942397388!3d19.079762982125626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8431e1e3dd2bfe03%3A0x3e4a929fc838d55a!2sRestaurant%20bar%20meranti!5e0!3m2!1ses!2smx!4v1766904843309!5m2!1ses!2smx';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.setAttribute('title', 'Ubicación de Meranti Restaurante');

        // When iframe loads, remove facade and loading state
        iframe.onload = () => {
            mapFacade.remove();
            mapContainer.classList.remove('loading');
        };

        // Handle error
        iframe.onerror = () => {
            mapContainer.classList.remove('loading');
            loadBtn.textContent = 'Error al cargar el mapa';
        };

        // Add iframe to container
        mapContainer.appendChild(iframe);
    });
}
