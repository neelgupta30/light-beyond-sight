(function () {
    'use strict';

    // --- Scroll reveal ---
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

    // --- Navbar scroll state ---
    var nav = document.querySelector('.navbar');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // --- Mobile nav toggle ---
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

    // --- Donation banner — always visible on every page load ---
    var banner = document.getElementById('donationBanner');
    var bannerClose = document.getElementById('donationBannerClose');
    if (banner && bannerClose) {
        bannerClose.addEventListener('click', function () {
            banner.style.display = 'none';
        });
    }

    // ============================================================
    // Auth
    // Admin: admin@lightbeyondsight.org / LBS@admin2026
    // ============================================================
    window.LBSAuth = {
        ADMIN_EMAIL: 'admin@lightbeyondsight.org',
        ADMIN_PASS:  'LBS@admin2026',

        login: function (email, password) {
            var role = (email.trim().toLowerCase() === this.ADMIN_EMAIL &&
                        password === this.ADMIN_PASS) ? 'admin' : 'user';
            localStorage.setItem('lbs_session', JSON.stringify({ role: role, email: email }));
            return role;
        },

        signup: function (name, email) {
            localStorage.setItem('lbs_session', JSON.stringify({ role: 'user', email: email, name: name }));
        },

        logout: function () {
            localStorage.removeItem('lbs_session');
        },

        getUser: function () {
            try { return JSON.parse(localStorage.getItem('lbs_session')); } catch (e) { return null; }
        },

        isAdmin: function () {
            var u = this.getUser();
            return !!(u && u.role === 'admin');
        }
    };

    // ============================================================
    // Posts (News & Events)
    // ============================================================
    window.LBSPosts = {
        get: function () {
            try { return JSON.parse(localStorage.getItem('lbs_posts')) || []; } catch (e) { return []; }
        },
        save: function (list) { localStorage.setItem('lbs_posts', JSON.stringify(list)); },
        add: function (post) {
            var list = this.get();
            post.id = Date.now().toString();
            list.unshift(post);
            this.save(list);
            return post;
        },
        remove: function (id) {
            this.save(this.get().filter(function (p) { return p.id !== id; }));
        }
    };

    // ============================================================
    // Podcasts
    // ============================================================
    window.LBSPodcasts = {
        get: function () {
            try { return JSON.parse(localStorage.getItem('lbs_podcasts')) || []; } catch (e) { return []; }
        },
        save: function (list) { localStorage.setItem('lbs_podcasts', JSON.stringify(list)); },
        add: function (ep) {
            var list = this.get();
            ep.id = Date.now().toString();
            list.unshift(ep);
            this.save(list);
            return ep;
        },
        remove: function (id) {
            this.save(this.get().filter(function (p) { return p.id !== id; }));
        }
    };

    // --- Reflect auth state in nav ---
    var loginLink = document.querySelector('a.nav-login');
    if (loginLink) {
        var currentUser = window.LBSAuth.getUser();
        if (currentUser) {
            if (window.LBSAuth.isAdmin()) {
                loginLink.textContent = 'Admin';
            } else {
                loginLink.textContent = 'Account';
            }
        }
    }

})();
