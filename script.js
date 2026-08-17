/* ──────────────────────────────────────────────────────
   Whitney & Gytis Wedding Website — main script
   ────────────────────────────────────────────────────── */

/* ─── Soft Passcode Gate ───────────────────────────── */
(function initPasscodeGate() {
  const PASSCODE = 'WHITNEYGYTIS2026';
  const gate = document.getElementById('passcode-gate');
  const input = document.getElementById('passcode-input');
  const submit = document.getElementById('passcode-submit');
  const error = document.getElementById('passcode-error');
  const unlocked = localStorage.getItem('weddingUnlocked') === 'true';

  if (!gate) return;

  function unlockSite() {
    gate.classList.add('hidden');
    document.body.classList.remove('locked');
    localStorage.setItem('weddingUnlocked', 'true');
  }

  function checkCode() {
    const value = input.value.trim();
    if (value === PASSCODE) {
      error.textContent = '';
      unlockSite();
      return;
    }
    error.textContent = 'Incorrect passcode. Please try again.';
    input.value = '';
    input.focus();
  }

  if (unlocked) {
    unlockSite();
    return;
  }

  input.focus();
  submit.addEventListener('click', checkCode);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkCode();
    }
  });
})();

/* ─── Language Switching ───────────────────────────── */
(function initLanguage() {
  const langToggle = document.getElementById('lang-toggle');
  const langMenu   = document.getElementById('lang-menu');
  const langBtns   = document.querySelectorAll('.lang-menu button');
  let currentLang  = localStorage.getItem('weddingLang') || 'en';

  // ── Language code to flag/name mapping ──
  const langNames = { en: '🌐 EN', fr: '🇫🇷 FR', lt: '🇱🇹 LT' };

  // ── Set button label ──
  function updateLangBtn() {
    langToggle.textContent = langNames[currentLang] || langNames.en;
  }

  // ── Translate element ──
  function translateElement(el) {
    const key = el.getAttribute('data-key');
    if (!key || !translations[currentLang] || !translations[currentLang][key]) return;

    const text = translations[currentLang][key];
    // Check if element has HTML content (contains <br/>, <strong>, etc)
    if (text.includes('<')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  }

  // ── Translate placeholder/aria-label ──
  function translateAttribute(el) {
    const placeholderKey = el.getAttribute('data-placeholder');
    if (placeholderKey && translations[currentLang] && translations[currentLang][placeholderKey]) {
      el.placeholder = translations[currentLang][placeholderKey];
    }
  }

  // ── Main translation function ──
  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('weddingLang', lang);
    updateLangBtn();

    // Translate all [data-key] elements
    document.querySelectorAll('[data-key]').forEach(translateElement);
    // Translate all [data-placeholder] elements
    document.querySelectorAll('[data-placeholder]').forEach(translateAttribute);

    // Update option elements (for select)
    document.querySelectorAll('option[data-key]').forEach(opt => {
      const key = opt.getAttribute('data-key');
      if (translations[currentLang] && translations[currentLang][key]) {
        opt.textContent = translations[currentLang][key];
      }
    });
  }

  // ── Toggle language menu ──
  langToggle.addEventListener('click', () => {
    langMenu.classList.toggle('hidden');
  });

  // ── Close menu when clicking outside ──
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-selector')) {
      langMenu.classList.add('hidden');
    }
  });

  // ── Language button clicks ──
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
      langMenu.classList.add('hidden');
    });
  });

  // ── Initialize ──
  setLanguage(currentLang);
  updateLangBtn();
})();

/* ─── Navbar scroll behaviour ──────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Countdown timer ──────────────────────────────── */
(function initCountdown() {
  const weddingDate = new Date('2026-11-24T14:00:00');
  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minsEl    = document.getElementById('minutes');
  const secsEl    = document.getElementById('seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent =
        minsEl.textContent = secsEl.textContent = '00';
      return;
    }

    const days  = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins  = Math.floor((diff % 3_600_000)  / 60_000);
    const secs  = Math.floor((diff % 60_000)     / 1_000);

    daysEl.textContent  = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
    secsEl.textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─── RSVP form ─────────────────────────────────────── */
(function initRSVP() {
  const form          = document.getElementById('rsvp-form');
  if (!form) return;

  const successPanel  = document.getElementById('rsvp-success');
  const successHeading = document.getElementById('success-heading');
  const successMsg    = document.getElementById('success-message');
  const againBtn      = document.getElementById('rsvp-again');
  const guestsGroup   = document.getElementById('guests-group');
  const dietaryGroup  = document.getElementById('dietary-group');
  const statusEl      = document.getElementById('form-status');
  const submitBtn     = form.querySelector('button[type="submit"]');
  const attendingRadios = form.querySelectorAll('input[name="attending"]');
  const endpoint      = form.getAttribute('action');

  // ── Show/hide guest & dietary fields based on attendance ──
  function toggleAttendingFields() {
    const attending = form.querySelector('input[name="attending"]:checked');
    const isYes = attending && attending.value === 'yes';
    guestsGroup.classList.toggle('form-hidden', !isYes);
    dietaryGroup.classList.toggle('form-hidden', !isYes);
  }

  attendingRadios.forEach(r => r.addEventListener('change', toggleAttendingFields));
  // Initialise — hide until selected
  guestsGroup.classList.add('form-hidden');
  dietaryGroup.classList.add('form-hidden');

  // ── Validation helpers ──
  function setError(el, hasError) {
    el.classList.toggle('error', hasError);
  }

  function getCurrentLang() {
    return localStorage.getItem('weddingLang') || 'en';
  }

  function t(key) {
    const lang = getCurrentLang();
    return translations[lang]?.[key] || translations.en?.[key] || '';
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden', 'is-error', 'is-success');
    if (type) statusEl.classList.add(`is-${type}`);
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.classList.add('hidden');
    statusEl.classList.remove('is-error', 'is-success');
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? t('form_submitting') : t('form_submit');
  }

  function validate() {
    let valid = true;

    const firstName = form.querySelector('#first-name');
    const lastName  = form.querySelector('#last-name');
    const email     = form.querySelector('#email');
    const attending = form.querySelector('input[name="attending"]:checked');

    if (!firstName.value.trim()) { setError(firstName, true); valid = false; }
    else                          { setError(firstName, false); }

    if (!lastName.value.trim())  { setError(lastName, true); valid = false; }
    else                          { setError(lastName, false); }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    setError(email, !emailOk);
    if (!emailOk) valid = false;

    if (!attending) {
      // Highlight radio group container
      const rg = form.querySelector('.radio-group');
      rg.style.outline = '2px solid #c0392b';
      rg.style.borderRadius = '4px';
      valid = false;
    } else {
      const rg = form.querySelector('.radio-group');
      rg.style.outline = '';
    }

    return valid;
  }

  // ── Clear error on input ──
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      setError(el, false);
      if (statusEl && !statusEl.classList.contains('hidden')) {
        clearStatus();
      }
    });
  });

  // ── Submit ──
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validate()) return;

    clearStatus();

    const attendingValue = form.querySelector('input[name="attending"]:checked').value;
    const attendingYes = attendingValue === 'yes';
    const data = {
      firstName: form.querySelector('#first-name').value.trim(),
      lastName:  form.querySelector('#last-name').value.trim(),
      email:     form.querySelector('#email').value.trim(),
      attending: attendingValue,
      guests:    attendingYes ? form.querySelector('#guests').value : '0',
      dietary:   attendingYes ? form.querySelector('#dietary').value.trim() : '',
      timestamp: new Date().toISOString(),
    };

    const formData = new FormData(form);
    formData.set('attending', data.attending);
    formData.set('guests', data.guests);
    formData.set('dietary', data.dietary);
    formData.set('submitted_at', data.timestamp);

    try {
      setSubmitting(true);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = Array.isArray(result.errors) && result.errors.length
          ? result.errors.map((item) => item.message).join(' ')
          : t('form_submit_error');
        throw new Error(errorMessage);
      }

      // Persist to localStorage as a local backup after successful submission
      saveRSVP(data);

      // Get current language for success messages
      const currentLang = getCurrentLang();
      const isYes = data.attending === 'yes';
      let heading, message;

      if (isYes) {
        const headingKey = 'success_heading_yes';
        heading = translations[currentLang][headingKey].replace('{name}', data.firstName);
        
        const guestKey = data.guests === '1' ? 'success_message_guests_1' : 'success_message_guests_n';
        const guestText = data.guests === '1' 
          ? translations[currentLang][guestKey]
          : translations[currentLang][guestKey].replace('{count}', data.guests);
        
        const msgKey = 'success_message_yes';
        message = translations[currentLang][msgKey].replace('{guests}', guestText);
      } else {
        const headingKey = 'success_heading_no';
        heading = translations[currentLang][headingKey].replace('{name}', data.firstName);
        const msgKey = 'success_message_no';
        message = translations[currentLang][msgKey];
      }

      successHeading.textContent = heading;
      successMsg.textContent = message;

      form.classList.add('hidden');
      form.style.display = 'none';
      successPanel.classList.remove('hidden');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      showStatus(error.message || t('form_submit_error'), 'error');
    } finally {
      setSubmitting(false);
    }
  });

  // ── Submit another response ──
  againBtn.addEventListener('click', function () {
    form.reset();
    clearStatus();
    guestsGroup.classList.add('form-hidden');
    dietaryGroup.classList.add('form-hidden');
    form.classList.remove('hidden');
    form.style.display = '';
    successPanel.classList.add('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Persist to localStorage ──
  function saveRSVP(data) {
    try {
      const key = 'weddingRSVPs';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(data);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (_) {
      // localStorage may not be available in some contexts — fail silently
    }
  }
})();

/* ─── Smooth scroll for nav links (fallback for older browsers) ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar').offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Intersection Observer — fade in sections ──────── */
(function initFadeIn() {
  const style = document.createElement('style');
  style.textContent = `
    .fade-section { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-section.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll('section:not(#hero), footer');
  sections.forEach(s => s.classList.add('fade-section'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => observer.observe(s));
})();
