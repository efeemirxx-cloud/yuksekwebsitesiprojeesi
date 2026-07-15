/* ============================================
   YUKARI AJANS — JavaScript
   Animasyonlar, Etkileşimler, Scroll Efektleri
   ============================================ */

(function () {
    'use strict';

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

    /* ========== Header Scroll Efekti — Beyaz panelle orantılı ========== */
    function initHeaderScroll() {
        const liquidGlassBg = document.querySelector('.liquid-glass-bg');
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;
            const heroHeight = DOM.hero ? DOM.hero.offsetHeight : window.innerHeight;
            
            // Beyaz panel yaklaşırken header glass bg yukarıdan kademeli kayarak gelsin
            // %55 scroll = başlangıç, %95 scroll = tamamen görünür
            const fadeStart = heroHeight * 0.55;
            const fadeEnd = heroHeight * 0.95;
            
            let progress = 0;
            if (scrollY > fadeStart) {
                progress = Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
            }
            
            // translateY ile kaydır — opacity'ye dokunma (backdrop-filter bozulmasın)
            if (liquidGlassBg) {
                const translateVal = -100 + (progress * 100);
                liquidGlassBg.style.transform = `translateY(${translateVal}%)`;
            }
            
            if (progress >= 1) {
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

        // Sayfa yüklendiğinde kontrol et
        updateHeader();
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
            const offset = scrollY * 0.35;
            
            // Stacking context (katman çakışması) yaratıp blend-mode'u bozmamak için 
            // transform efektini parent (heroContent) yerine doğrudan child katmanlara veriyoruz.
            const knockoutLayer = document.querySelector('.hero__glass-knockout-layer');
            const differenceLayer = document.querySelector('.hero__glass-difference-layer');
            
            if (knockoutLayer && differenceLayer) {
                knockoutLayer.style.transform = `translateY(${offset}px)`;
                differenceLayer.style.transform = `translateY(${offset}px)`;
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

    function init() {
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
