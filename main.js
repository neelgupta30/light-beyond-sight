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

    // --- Donation banner (always shows on every page load) ---
    var banner = document.getElementById('donationBanner');
    var bannerClose = document.getElementById('donationBannerClose');
    if (banner && bannerClose) {
        bannerClose.addEventListener('click', function () {
            banner.style.display = 'none';
        });
    }

    // ============================================================
    // Auth  (admin@lightbeyondsight.com / admin  — change on first login)
    // ============================================================
    window.LBSAuth = {
        _defaults: {
            email:              'admin@lightbeyondsight.com',
            password:           'admin',
            mustChangePassword: true,
            totpEnabled:        false,
            totpSecret:         null
        },

        getConfig: function () {
            try {
                return JSON.parse(localStorage.getItem('lbs_admin_config')) ||
                       Object.assign({}, this._defaults);
            } catch (e) {
                return Object.assign({}, this._defaults);
            }
        },

        saveConfig: function (cfg) {
            localStorage.setItem('lbs_admin_config', JSON.stringify(cfg));
        },

        // Returns { valid, role, needsPasswordChange, needsTOTP, totpSecret }
        checkCredentials: function (email, password) {
            var cfg = this.getConfig();
            if (email.trim().toLowerCase() === cfg.email.toLowerCase() &&
                password === cfg.password) {
                return {
                    valid:               true,
                    role:                'admin',
                    needsPasswordChange: cfg.mustChangePassword,
                    needsTOTP:           cfg.totpEnabled && !cfg.mustChangePassword,
                    totpSecret:          cfg.totpSecret
                };
            }
            return { valid: false };
        },

        createSession: function (role, email, rememberMe) {
            var ttl = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
            localStorage.setItem('lbs_session', JSON.stringify({
                role: role, email: email,
                expires: Date.now() + ttl
            }));
        },

        signup: function (name, email) {
            localStorage.setItem('lbs_session', JSON.stringify({
                role: 'user', email: email, name: name,
                expires: Date.now() + 8 * 60 * 60 * 1000
            }));
        },

        logout: function () { localStorage.removeItem('lbs_session'); },

        getUser: function () {
            try {
                var u = JSON.parse(localStorage.getItem('lbs_session'));
                if (u && u.expires && u.expires < Date.now()) { this.logout(); return null; }
                return u;
            } catch (e) { return null; }
        },

        isAdmin: function () {
            var u = this.getUser();
            return !!(u && u.role === 'admin');
        },

        changePassword: function (newPassword) {
            var cfg = this.getConfig();
            cfg.password           = newPassword;
            cfg.mustChangePassword = false;
            this.saveConfig(cfg);
        },

        setupTOTP: function (secret) {
            var cfg         = this.getConfig();
            cfg.totpSecret  = secret;
            cfg.totpEnabled = true;
            this.saveConfig(cfg);
        },

        disableTOTP: function () {
            var cfg         = this.getConfig();
            cfg.totpEnabled = false;
            cfg.totpSecret  = null;
            this.saveConfig(cfg);
        }
    };

    // ============================================================
    // TOTP — RFC 6238, pure Web Crypto, no external dependencies
    // ============================================================
    window.LBSTOTP = {
        _alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',

        generateSecret: function () {
            var bytes = new Uint8Array(20);
            crypto.getRandomValues(bytes);
            var s = '';
            for (var i = 0; i < 20; i++) s += this._alpha[bytes[i] & 31];
            return s;
        },

        _b32decode: function (str) {
            var s = str.replace(/=+$/, '').toUpperCase();
            var bits = 0, val = 0, out = [];
            for (var i = 0; i < s.length; i++) {
                var idx = this._alpha.indexOf(s[i]);
                if (idx < 0) continue;
                val  = (val << 5) | idx;
                bits += 5;
                if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
            }
            return new Uint8Array(out);
        },

        getCode: async function (secret, offset) {
            var t   = Math.floor(Date.now() / 30000) + (offset || 0);
            var buf = new ArrayBuffer(8);
            new DataView(buf).setUint32(4, t, false);
            var key = await crypto.subtle.importKey(
                'raw', this._b32decode(secret),
                { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
            );
            var sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
            var off = sig[19] & 0xf;
            var code = (
                ((sig[off]   & 0x7f) << 24) |
                ((sig[off+1] & 0xff) << 16) |
                ((sig[off+2] & 0xff) << 8)  |
                 (sig[off+3] & 0xff)
            ) % 1000000;
            return code.toString().padStart(6, '0');
        },

        verify: async function (secret, input) {
            var code = input.replace(/\s/g, '');
            for (var w = -1; w <= 1; w++) {
                if (await this.getCode(secret, w) === code) return true;
            }
            return false;
        },

        qrUrl: function (secret, email) {
            var uri = 'otpauth://totp/' +
                encodeURIComponent('Light Beyond Sight:' + email) +
                '?secret=' + secret +
                '&issuer=Light%20Beyond%20Sight&algorithm=SHA1&digits=6&period=30';
            return 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
                   encodeURIComponent(uri);
        }
    };

    // ============================================================
    // Posts (News & Events)
    // ============================================================
    window.LBSPosts = {
        get:    function () { try { return JSON.parse(localStorage.getItem('lbs_posts'))    || []; } catch (e) { return []; } },
        save:   function (l) { localStorage.setItem('lbs_posts',    JSON.stringify(l)); },
        add:    function (p) { var l = this.get(); p.id = Date.now().toString(); l.unshift(p); this.save(l); return p; },
        remove: function (id) { this.save(this.get().filter(function (p) { return p.id !== id; })); }
    };

    // ============================================================
    // Podcasts
    // ============================================================
    window.LBSPodcasts = {
        get:    function () { try { return JSON.parse(localStorage.getItem('lbs_podcasts')) || []; } catch (e) { return []; } },
        save:   function (l) { localStorage.setItem('lbs_podcasts', JSON.stringify(l)); },
        add:    function (p) { var l = this.get(); p.id = Date.now().toString(); l.unshift(p); this.save(l); return p; },
        remove: function (id) { this.save(this.get().filter(function (p) { return p.id !== id; })); }
    };

    // ============================================================
    // Resources (Videos · Photos · Documents)
    // ============================================================
    window.LBSResources = {
        get:    function () { try { return JSON.parse(localStorage.getItem('lbs_resources')) || []; } catch (e) { return []; } },
        save:   function (l) { localStorage.setItem('lbs_resources', JSON.stringify(l)); },
        add:    function (r) { var l = this.get(); r.id = Date.now().toString(); l.unshift(r); this.save(l); return r; },
        remove: function (id) { this.save(this.get().filter(function (r) { return r.id !== id; })); },

        embedUrl: function (url) {
            if (!url) return null;
            var yt = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
            if (yt) return 'https://www.youtube.com/embed/' + yt[1] + '?rel=0';
            var vm = url.match(/vimeo\.com\/(\d+)/);
            if (vm) return 'https://player.vimeo.com/video/' + vm[1];
            if (/youtube\.com\/embed|player\.vimeo\.com/.test(url)) return url;
            return null;
        }
    };

    // ============================================================
    // Reflect auth state in nav
    // ============================================================
    var loginLink = document.querySelector('a.nav-login');
    if (loginLink) {
        var currentUser = window.LBSAuth.getUser();
        if (currentUser) {
            if (window.LBSAuth.isAdmin()) {
                loginLink.textContent = 'Admin';
                loginLink.href        = 'admin.html';
            } else {
                loginLink.textContent = 'Account';
            }
        }
    }

})();
