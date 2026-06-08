(function () {
    'use strict';

    /* ============================================================
       Inject modal into DOM
    ============================================================ */
    var MODAL_HTML = [
        '<div class="dm-overlay" id="donateModal" role="dialog" aria-modal="true" aria-label="Donation form">',
        '  <div class="dm-card">',

        '    <!-- Header -->',
        '    <div class="dm-header">',
        '      <div class="dm-header-brand">',
        '        <img src="logo.png" alt="" class="dm-logo">',
        '        <div>',
        '          <h2 class="dm-title">Support Light Beyond Sight</h2>',
        '          <p class="dm-subtitle">501(c)(3) nonprofit &mdash; Donations are tax-deductible</p>',
        '        </div>',
        '      </div>',
        '      <button class="dm-close" id="dmClose" aria-label="Close donation form">&times;</button>',
        '    </div>',

        '    <!-- Step 1: Amount -->',
        '    <div class="dm-step" id="dmStep1">',
        '      <div class="dm-freq-toggle">',
        '        <button class="dm-freq-btn active" data-freq="once">One-time</button>',
        '        <button class="dm-freq-btn" data-freq="monthly">Monthly</button>',
        '      </div>',
        '      <div class="dm-amount-grid">',
        '        <button class="dm-amount-btn" data-amount="10">$10</button>',
        '        <button class="dm-amount-btn" data-amount="25">$25</button>',
        '        <button class="dm-amount-btn active" data-amount="50">$50</button>',
        '        <button class="dm-amount-btn" data-amount="100">$100</button>',
        '        <button class="dm-amount-btn" data-amount="250">$250</button>',
        '        <button class="dm-amount-btn dm-custom-trigger" data-amount="custom">Other</button>',
        '      </div>',
        '      <div class="dm-custom-wrap" id="dmCustomWrap">',
        '        <span class="dm-custom-prefix">$</span>',
        '        <input type="number" id="dmCustomAmt" placeholder="Enter amount" min="1" aria-label="Custom donation amount">',
        '      </div>',
        '      <button class="dm-btn-primary" id="dmStep1Next">Continue',
        '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        '      </button>',
        '    </div>',

        '    <!-- Step 2: Card details -->',
        '    <div class="dm-step" id="dmStep2" style="display:none;">',
        '      <div class="dm-step2-top">',
        '        <button class="dm-back-btn" id="dmBack">',
        '          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
        '          Back',
        '        </button>',
        '        <div class="dm-donation-summary" id="dmSummary">Donating $50 one-time</div>',
        '      </div>',
        '      <div class="dm-field-row">',
        '        <div class="dm-field">',
        '          <label for="dmFirst">First name</label>',
        '          <input type="text" id="dmFirst" placeholder="Jane" autocomplete="given-name">',
        '        </div>',
        '        <div class="dm-field">',
        '          <label for="dmLast">Last name</label>',
        '          <input type="text" id="dmLast" placeholder="Smith" autocomplete="family-name">',
        '        </div>',
        '      </div>',
        '      <div class="dm-field">',
        '        <label for="dmEmail">Email address</label>',
        '        <input type="email" id="dmEmail" placeholder="you@example.com" autocomplete="email">',
        '      </div>',
        '      <div class="dm-field">',
        '        <label for="dmCardNum">Card number</label>',
        '        <div class="dm-card-input-wrap">',
        '          <input type="text" id="dmCardNum" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric" autocomplete="cc-number">',
        '          <span class="dm-card-icon" id="dmCardIcon"></span>',
        '        </div>',
        '      </div>',
        '      <div class="dm-field-row">',
        '        <div class="dm-field">',
        '          <label for="dmExpiry">Expiry</label>',
        '          <input type="text" id="dmExpiry" placeholder="MM / YY" maxlength="7" inputmode="numeric" autocomplete="cc-exp">',
        '        </div>',
        '        <div class="dm-field">',
        '          <label for="dmCVV">CVV</label>',
        '          <input type="text" id="dmCVV" placeholder="123" maxlength="4" inputmode="numeric" autocomplete="cc-csc">',
        '        </div>',
        '        <div class="dm-field">',
        '          <label for="dmZip">ZIP / Postal</label>',
        '          <input type="text" id="dmZip" placeholder="10001" maxlength="10" inputmode="numeric" autocomplete="postal-code">',
        '        </div>',
        '      </div>',
        '      <div class="dm-msg" id="dmMsg"></div>',
        '      <button class="dm-btn-primary dm-donate-btn" id="dmDonateBtn">',
        '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        '        <span id="dmDonateBtnLabel">Donate $50</span>',
        '      </button>',
        '      <div class="dm-security-row">',
        '        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        '        256-bit SSL encryption &nbsp;&middot;&nbsp; Secure payment',
        '      </div>',
        '    </div>',

        '    <!-- Step 3: Success -->',
        '    <div class="dm-step dm-success-step" id="dmStep3" style="display:none;">',
        '      <div class="dm-success-icon">',
        '        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        '      </div>',
        '      <h3 class="dm-success-title">Thank you!</h3>',
        '      <p class="dm-success-msg" id="dmSuccessMsg">Your donation of $50 has been received. A receipt will be sent to your email address.</p>',
        '      <p class="dm-success-sub">Your generosity helps us deliver accessible health education to the blind and visually impaired community — free for everyone who needs it.</p>',
        '      <button class="dm-btn-primary" id="dmDone">Close</button>',
        '    </div>',

        '  </div>',
        '</div>'
    ].join('\n');

    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

    /* ============================================================
       State
    ============================================================ */
    var state = { amount: 50, frequency: 'once', custom: false };

    /* ============================================================
       DOM refs
    ============================================================ */
    var modal     = document.getElementById('donateModal');
    var step1     = document.getElementById('dmStep1');
    var step2     = document.getElementById('dmStep2');
    var step3     = document.getElementById('dmStep3');

    /* ============================================================
       Open / close
    ============================================================ */
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Reset to step 1
        showStep(1);
        document.getElementById('dmFirst') && (document.getElementById('dmFirst').value = '');
        document.getElementById('dmLast')  && (document.getElementById('dmLast').value  = '');
        document.getElementById('dmEmail') && (document.getElementById('dmEmail').value = '');
        document.getElementById('dmCardNum') && (document.getElementById('dmCardNum').value = '');
        document.getElementById('dmExpiry')  && (document.getElementById('dmExpiry').value  = '');
        document.getElementById('dmCVV')     && (document.getElementById('dmCVV').value     = '');
        document.getElementById('dmZip')     && (document.getElementById('dmZip').value     = '');
        clearMsg();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showStep(n) {
        step1.style.display = n === 1 ? 'block' : 'none';
        step2.style.display = n === 2 ? 'block' : 'none';
        step3.style.display = n === 3 ? 'block' : 'none';
    }

    /* ============================================================
       Intercept all donate links
    ============================================================ */
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest(
            '.donation-banner-link, [data-donate], .hero-donate-btn'
        );
        if (trigger) { e.preventDefault(); openModal(); return; }

        if (e.target.closest('#dmClose, .dm-overlay') &&
            !e.target.closest('.dm-card')) {
            closeModal();
        }
    });

    document.getElementById('dmClose').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    /* ============================================================
       Step 1: Amount & frequency
    ============================================================ */
    var freqBtns   = document.querySelectorAll('.dm-freq-btn');
    var amountBtns = document.querySelectorAll('.dm-amount-btn');
    var customWrap = document.getElementById('dmCustomWrap');
    var customInp  = document.getElementById('dmCustomAmt');

    freqBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            freqBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state.frequency = btn.dataset.freq;
        });
    });

    amountBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            amountBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            if (btn.dataset.amount === 'custom') {
                state.custom = true;
                customWrap.style.display = 'flex';
                customInp.focus();
            } else {
                state.custom = false;
                state.amount = parseInt(btn.dataset.amount, 10);
                customWrap.style.display = 'none';
            }
        });
    });

    document.getElementById('dmStep1Next').addEventListener('click', function () {
        if (state.custom) {
            var v = parseFloat(customInp.value);
            if (!v || v < 1) { customInp.focus(); return; }
            state.amount = v;
        }
        updateStep2Summary();
        showStep(2);
        document.getElementById('dmFirst') && document.getElementById('dmFirst').focus();
    });

    function updateStep2Summary() {
        var label = '$' + state.amount + (state.frequency === 'monthly' ? ' / month' : ' one-time');
        document.getElementById('dmSummary').textContent = 'Donating ' + label;
        document.getElementById('dmDonateBtnLabel').textContent = 'Donate ' + label.split(' ')[0];
    }

    document.getElementById('dmBack').addEventListener('click', function () { showStep(1); });

    /* ============================================================
       Card formatting & type detection
    ============================================================ */
    var CARD_PATTERNS = {
        visa:       /^4/,
        mastercard: /^5[1-5]|^2[2-7]/,
        amex:       /^3[47]/,
        discover:   /^6011|^65|^64[4-9]|^622/
    };

    var CARD_SVGS = {
        visa: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#1a1f71"/><path d="M20 22H17l2-12h3zM14 10l-3 8-.4-2-1.1-5.6S9.4 10 8 10H3.1l-.1.3c1.3.3 2.7.9 3.6 1.5l3 10.2H13l5-12h-4zm23 12l-2.5-12H32l-4.8 12H31l.7-2h4.2l.4 2H39zm-5-5l1.7-4.8.9 4.8h-2.6zM27 14.4c0-.3.3-1.4 1.9-1.4.9 0 1.6.2 2.1.4l.3-2.6c-.6-.2-1.5-.5-2.6-.5-2.8 0-4.8 1.5-4.8 3.6 0 1.6 1.4 2.5 2.5 3 1.1.6 1.5.9 1.5 1.4 0 .8-.9 1.1-1.7 1.1-1.1 0-1.7-.2-2.6-.6l-.4 2.6c.6.3 1.7.5 2.8.5 3 0 4.9-1.5 4.9-3.8 0-2.9-4-3.1-3.9-3.7z" fill="white"/></svg>',
        mastercard: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="18" cy="16" r="9" fill="#eb001b"/><circle cx="30" cy="16" r="9" fill="#f79e1b"/><path d="M24 9.5a9 9 0 0 1 0 13A9 9 0 0 1 24 9.5z" fill="#ff5f00"/></svg>',
        amex: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#2557d6"/><text x="8" y="22" font-family="Arial" font-size="10" font-weight="bold" fill="white">AMEX</text></svg>',
        discover: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0"/><text x="5" y="14" font-family="Arial" font-size="6" fill="#231f20">DISCOVER</text><circle cx="32" cy="16" r="8" fill="#f76f20"/></svg>'
    };

    var cardNumInp  = document.getElementById('dmCardNum');
    var cardIconEl  = document.getElementById('dmCardIcon');
    var expiryInp   = document.getElementById('dmExpiry');
    var cvvInp      = document.getElementById('dmCVV');

    cardNumInp.addEventListener('input', function () {
        var v   = this.value.replace(/\D/g, '').slice(0, 16);
        var fmt = v.match(/.{1,4}/g);
        this.value = fmt ? fmt.join(' ') : v;
        var type = detectCard(v);
        cardIconEl.innerHTML = type ? (CARD_SVGS[type] || '') : '';
    });

    expiryInp.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').slice(0, 4);
        if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
        this.value = v;
    });

    cvvInp.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });

    function detectCard(num) {
        for (var type in CARD_PATTERNS) {
            if (CARD_PATTERNS[type].test(num)) return type;
        }
        return null;
    }

    function luhn(num) {
        var sum = 0, alt = false;
        for (var i = num.length - 1; i >= 0; i--) {
            var n = parseInt(num[i], 10);
            if (alt) { n *= 2; if (n > 9) n -= 9; }
            sum += n; alt = !alt;
        }
        return sum % 10 === 0;
    }

    /* ============================================================
       Step 2: Validate & submit
    ============================================================ */
    function showMsg(text, type) {
        var el = document.getElementById('dmMsg');
        el.textContent  = text;
        el.className    = 'dm-msg dm-msg--' + (type || 'error');
    }

    function clearMsg() {
        var el = document.getElementById('dmMsg');
        if (el) { el.textContent = ''; el.className = 'dm-msg'; }
    }

    document.getElementById('dmDonateBtn').addEventListener('click', function () {
        clearMsg();

        var first  = document.getElementById('dmFirst').value.trim();
        var last   = document.getElementById('dmLast').value.trim();
        var email  = document.getElementById('dmEmail').value.trim();
        var rawNum = document.getElementById('dmCardNum').value.replace(/\s/g, '');
        var expiry = document.getElementById('dmExpiry').value.replace(/\s/g, '');
        var cvv    = document.getElementById('dmCVV').value.trim();
        var zip    = document.getElementById('dmZip').value.trim();

        if (!first || !last)  { showMsg('Please enter your full name.', 'error'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('Please enter a valid email address.', 'error'); return; }
        if (rawNum.length < 13 || !luhn(rawNum))        { showMsg('Please enter a valid card number.', 'error'); return; }
        if (expiry.replace('/', '').length < 4)         { showMsg('Please enter a valid expiry date.', 'error'); return; }
        if (cvv.length < 3)                             { showMsg('Please enter your CVV.', 'error'); return; }
        if (!zip)                                       { showMsg('Please enter your ZIP / postal code.', 'error'); return; }

        // Simulate processing
        var btn = document.getElementById('dmDonateBtn');
        btn.disabled    = true;
        btn.querySelector('#dmDonateBtnLabel').textContent = 'Processing…';

        setTimeout(function () {
            btn.disabled = false;
            btn.querySelector('#dmDonateBtnLabel').textContent = 'Donate ' + formatAmt();
            var label = '$' + state.amount + (state.frequency === 'monthly' ? ' per month' : '');
            document.getElementById('dmSuccessMsg').textContent =
                'Your ' + (state.frequency === 'monthly' ? 'recurring ' : '') +
                'donation of ' + label + ' to Light Beyond Sight has been received. ' +
                'A tax receipt will be sent to ' + email + '.';
            showStep(3);
        }, 1400);
    });

    function formatAmt() {
        return '$' + state.amount + (state.frequency === 'monthly' ? '/mo' : '');
    }

    document.getElementById('dmDone').addEventListener('click', closeModal);

})();
