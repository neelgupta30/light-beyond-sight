(function () {
    'use strict';

    // Scroll reveal
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }

    // Navbar scroll state
    var nav = document.querySelector('.navbar');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // Mobile nav toggle
    var toggle = document.querySelector('.nav-toggle');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        nav.querySelectorAll('.nav-menu a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (e) {
            if (nav.classList.contains('nav-open') && !nav.contains(e.target)) {
                nav.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Donation banner dismiss (persists for the session)
    var banner = document.getElementById('donationBanner');
    var closeBtn = document.getElementById('donationBannerClose');
    if (banner) {
        if (sessionStorage.getItem('bannerDismissed')) {
            banner.style.display = 'none';
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                banner.style.display = 'none';
                sessionStorage.setItem('bannerDismissed', '1');
            });
        }
    }
})();
