'use strict';

/*
 * Enable JavaScript-only navigation behaviour.
 * The navigation remains visible and usable without JavaScript.
 */
document.documentElement.classList.add('js');

(function () {
    const header = document.getElementById('site-header');
    const navToggle = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-navigation');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const backToTop = document.getElementById('back-to-top');
    const year = document.getElementById('year');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    /* -----------------------------------------------------
       Mobile navigation
       ----------------------------------------------------- */
    function setMenu(open, restoreFocus) {
        if (!navToggle || !primaryNav) {
            return;
        }

        primaryNav.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');

        if (!open && restoreFocus) {
            navToggle.focus();
        }
    }

    function isMenuOpen() {
        return Boolean(primaryNav && primaryNav.classList.contains('is-open'));
    }

    function focusSection(link) {
        const targetId = link.getAttribute('href');
        const target = targetId ? document.querySelector(targetId) : null;

        if (!target) {
            return;
        }

        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', function removeTemporaryTabindex() {
            target.removeAttribute('tabindex');
        }, { once: true });
    }

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', function () {
            setMenu(!isMenuOpen(), false);
        });

        primaryNav.addEventListener('click', function (event) {
            const link = event.target.closest('a');

            if (!link || !isMenuOpen()) {
                return;
            }

            setMenu(false, false);
            focusSection(link);
        });

        document.addEventListener('click', function (event) {
            if (!isMenuOpen()) {
                return;
            }

            if (!primaryNav.contains(event.target) && !navToggle.contains(event.target)) {
                setMenu(false, false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isMenuOpen()) {
                setMenu(false, true);
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900 && isMenuOpen()) {
                setMenu(false, false);
            }
        });
    }

    /* -----------------------------------------------------
       Active section and header state
       ----------------------------------------------------- */
    const navSections = navLinks
        .map(function (link) {
            const targetId = link.getAttribute('href');
            return targetId ? document.querySelector(targetId) : null;
        })
        .filter(Boolean);

    function updateActiveNavigation() {
        if (!navSections.length) {
            return;
        }

        const headerHeight = header ? header.offsetHeight : 0;
        const probe = window.scrollY + headerHeight + 40;
        let currentSection = navSections[0];

        navSections.forEach(function (section) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;

            if (sectionTop <= probe) {
                currentSection = section;
            }
        });

        const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

        if (isAtPageEnd) {
            currentSection = navSections[navSections.length - 1];
        }

        navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + currentSection.id) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    let scrollFrameRequested = false;

    function handleScroll() {
        if (scrollFrameRequested) {
            return;
        }

        scrollFrameRequested = true;

        window.requestAnimationFrame(function () {
            const scrollPosition = window.scrollY;

            if (header) {
                header.classList.toggle('is-scrolled', scrollPosition > 8);
            }

            if (backToTop) {
                backToTop.classList.toggle('is-visible', scrollPosition > 600);
            }

            updateActiveNavigation();
            scrollFrameRequested = false;
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    /* -----------------------------------------------------
       Back to top
       ----------------------------------------------------- */
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        });
    }
})();
