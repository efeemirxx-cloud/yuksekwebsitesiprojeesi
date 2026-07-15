/* ============================================
   YUKARI AJANS — JavaScript
   Animasyonlar, Etkileşimler, Scroll Efektleri
   ============================================ */

(function () {
    'use strict';

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    /* ========== DOM Referansları ========== */
    const DOM = {
        body: document.body,
        introOverlay: document.getElementById('intro-overlay'),
        introLogo: document.getElementById('intro-logo'),
        header: document.getElementById('header'),
        headerLogoImg: document.querySelector('.header__logo-img'),
        menuToggle: document.querySelector('.header__menu-toggle'),
        nav: document.querySelector('.header__nav'),
        navLinks: document.querySelectorAll('.nav-link'),
        hero: document.querySelector('.hero'),
        heroContent: document.querySelector('.hero__content'),
        galleryItems: document.querySelectorAll('.gallery__item'),
        revealElements: document.querySelectorAll('.reveal'),
        statNumbers: document.querySelectorAll('.stat__number'),
    };

    /* ========== Logo Intro Animasyonu ========== */
    function initIntro() {
        const bgLayer = document.querySelector('.liquid-glass-bg');
        const logo = DOM.headerLogoImg;
        
        // Remove old intro overlay if it exists in DOM
        if (DOM.introOverlay) DOM.introOverlay.remove();
        
        if (!logo || !DOM.header) {
            if (DOM.header) DOM.header.classList.add('header--visible');
            if (bgLayer) bgLayer.classList.add('header--visible');
            return;
        }

        // Show header immediately so logo is visible
        DOM.header.classList.add('header--visible');

        function calculateCenterTransform() {
            logo.style.transform = 'none';
            const rect = logo.getBoundingClientRect();
            
            const width = rect.width || 570; // fallback width
            const height = rect.height || 190;

            const targetX = window.innerWidth / 2;
            const heroHeight = Math.max(window.innerHeight * 0.5, 300);
            const targetY = heroHeight / 2;
            
            const currentX = rect.left + width / 2;
            const currentY = rect.top + height / 2;
            
            const deltaX = targetX - currentX;
            const deltaY = targetY - currentY;
            
            return `translate(${deltaX}px, ${deltaY}px) scale(1.6)`;
        }

        // Set initial state
        logo.style.transform = calculateCenterTransform();
        let isAnimatedBack = false;

        const onResize = () => {
            if (isAnimatedBack) return;
            logo.style.transition = 'none'; // prevent animation during resize
            logo.style.transform = calculateCenterTransform();
        };
        window.addEventListener('resize', onResize);

        const animateLogoBack = () => {
            if (isAnimatedBack) return;
            isAnimatedBack = true;
            
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScrollListener);
            
            // Remove blur from background video
            const videoBg = document.querySelector('.hero__video-bg');
            if (videoBg) videoBg.classList.add('is-unblurred');
            
            requestAnimationFrame(() => {
                logo.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1)';
                logo.style.transform = 'translateX(10%) scale(1)';
            });
            
            setTimeout(() => {
                logo.style.transition = '';
                logo.style.transform = ''; // Fallback to CSS
                if (bgLayer) bgLayer.classList.add('header--visible');
            }, 300);
        };

        const onScrollListener = () => {
            if (window.scrollY > 5 && !isAnimatedBack) {
                animateLogoBack();
            }
        };

        // Sayfa yüklendiğinde halihazırda scroll yapılmışsa animasyonu tetikle
        window.addEventListener('load', () => {
            if (window.scrollY > 5 && !isAnimatedBack) {
                animateLogoBack();
            }
        });

        window.addEventListener('scroll', onScrollListener, { passive: true });
    }

    /* ========== Liquid Glass Header Dynamic Lighting ========== */
    function initLiquidGlassHeader() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (!DOM.header) return;

        let mouseX = 0;
        let mouseY = 0;
        let isHovering = false;
        
        DOM.header.addEventListener('mousemove', (e) => {
            const rect = DOM.header.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            
            DOM.header.style.setProperty('--mouse-x', `${mouseX}px`);
            DOM.header.style.setProperty('--mouse-y', `${mouseY}px`);
        });
        
        DOM.header.addEventListener('mouseenter', () => {
            isHovering = true;
            const highlight = DOM.header.querySelector('.liquid-glass-highlight');
            if(highlight) highlight.style.opacity = '1';
        });
        
        DOM.header.addEventListener('mouseleave', () => {
            isHovering = false;
            const highlight = DOM.header.querySelector('.liquid-glass-highlight');
            if(highlight) highlight.style.opacity = '0';
        });
    }

    /* ========== Header Scroll Efekti ========== */
    function initHeaderScroll() {
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            if (scrollY > 50) {
                DOM.header.classList.add('header--scrolled');
            } else {
                DOM.header.classList.remove('header--scrolled');
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ========== Mobil Menü ========== */
    function initMobileMenu() {
        if (!DOM.menuToggle) return;

        DOM.menuToggle.addEventListener('click', () => {
            DOM.menuToggle.classList.toggle('active');
            DOM.nav.classList.toggle('is-open');
            DOM.body.style.overflow = DOM.nav.classList.contains('is-open') ? 'hidden' : '';
        });

        // Link tıklanınca menüyü kapat
        DOM.navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                DOM.menuToggle.classList.remove('active');
                DOM.nav.classList.remove('is-open');
                DOM.body.style.overflow = '';
            });
        });
    }

    /* ========== Intersection Observer — Scroll Reveal ========== */
    function initScrollReveal() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1,
        };

        // Galeri öğeleri — kademeli (staggered) animasyon
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay * 100);
                    galleryObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.galleryItems.forEach((item, index) => {
            item.dataset.delay = index;
            galleryObserver.observe(item);
        });

        // Genel reveal elementleri
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.revealElements.forEach((el) => {
            revealObserver.observe(el);
        });
    }

    /* ========== Parallax Efekti ========== */
    function initParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            if (DOM.heroContent) {
                const offset = scrollY * 0.35;
                const opacity = 1 - scrollY / 700;
                DOM.heroContent.style.transform = `translateY(${offset}px)`;
                DOM.heroContent.style.opacity = Math.max(opacity, 0);
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ========== İstatistik Sayaç Animasyonu ========== */
    function initCountUp() {
        const observerOptions = {
            root: null,
            threshold: 0.5,
        };

        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const suffix = el.dataset.suffix || '';
                    animateCount(el, 0, target, 1800, suffix);
                    countObserver.unobserve(el);
                }
            });
        }, observerOptions);

        DOM.statNumbers.forEach((el) => {
            countObserver.observe(el);
        });
    }

    function animateCount(el, start, end, duration, suffix) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.round(start + (end - start) * eased);

            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    /* ========== Smooth Scroll — Anchor Linkleri ========== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 72;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                    });
                }
            });
        });
    }

    /* ========== Lazy Loading (Native + Fallback) ========== */
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) return;

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    }

    /* ========== Init ========== */
    function init() {
        initIntro();
        initLiquidGlassHeader();
        initHeaderScroll();
        initMobileMenu();
        initScrollReveal();
        initParallax();
        initCountUp();
        initSmoothScroll();
        initLazyLoading();
    }

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
