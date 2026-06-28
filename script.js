/* === SPLASH === */
const splash = document.getElementById('splash');
if (splash) {
  const splashFrame = document.getElementById('splashFrame');
  splashFrame.addEventListener('load', () => {
    try {
      const doc = splashFrame.contentDocument;

      const style = doc.createElement('style');
      style.textContent = 'button, #__bundler_err, #__bundler_loading { display: none !important; }';
      doc.head.appendChild(style);

      const colorBread = () => {
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.trim() === 'Bread') {
            node.parentElement.style.color = '#ffffff';
            return true;
          }
        }
        return false;
      };

      if (!colorBread()) {
        const obs = new MutationObserver(() => { if (colorBread()) obs.disconnect(); });
        obs.observe(doc.body, { childList: true, subtree: true });
      }
    } catch(e) {}
  });
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 700);
  }, 3500);
}

/* === REFS === */
const nav             = document.getElementById('nav');
const hamburger       = document.getElementById('hamburger');
const mobileMenu      = document.getElementById('mobileMenu');
const calcBtns        = document.querySelectorAll('.calc-btn');
const calcAddons      = document.querySelectorAll('.calc-addon');
const calcPriceEl     = document.getElementById('calcPrice');
const calcMonthlyEl   = document.getElementById('calcMonthly');
const calcMonthlyWrap = document.getElementById('calcMonthlyWrap');
const getQuoteBtn     = document.getElementById('getQuoteBtn');
const quoteSummary    = document.getElementById('quoteSummary');
const quoteSummaryBody = document.getElementById('quoteSummaryBody');
const quoteProjectIn  = document.getElementById('quoteProject');
const quotePriceIn    = document.getElementById('quotePrice');
const quoteAddonsIn   = document.getElementById('quoteAddons');
const quoteMonthlyIn  = document.getElementById('quoteMonthly');
const messageField    = document.getElementById('message');
const contactForm     = document.getElementById('contactForm');

/* === CALCULATOR DATA === */
const projData = {
  landing:  { min: 300,  max: 600,  label: 'Landing Page',     excludes: 'pages' },
  business: { min: 700,  max: 1500, label: 'Business Site',     excludes: null },
  seo:      { min: 200,  max: 500,  label: 'SEO & Performance', excludes: 'seo' },
};
const addonData = {
  seo:   { min: 100, max: 200, mMin: 0,  mMax: 0,   label: 'SEO Setup' },
  pages: { min: 150, max: 300, mMin: 0,  mMax: 0,   label: 'Extra Pages' },
  maint: { min: 0,   max: 0,   mMin: 50, mMax: 150, label: 'Monthly Maintenance' },
};

let currentProj = 'landing';
const addonState = { seo: false, pages: false, maint: false };

/* === MOBILE MENU === */
let menuOpen = false;

function toggleMenu(open) {
  menuOpen = open;
  mobileMenu.classList.toggle('closed', !open);
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = spans[2].style.transform = '';
    spans[1].style.opacity   = '';
  }
}

hamburger.addEventListener('click', () => toggleMenu(!menuOpen));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));
window.addEventListener('scroll', () => { if (menuOpen) toggleMenu(false); }, { passive: true });

/* === NAV SCROLL === */
let lastNavScroll = 0;
window.addEventListener('scroll', () => {
  const now = Date.now();
  if (now - lastNavScroll < 100) return;
  lastNavScroll = now;
  if (window.scrollY > 40) {
    nav.style.background     = 'rgba(6,9,14,.72)';
    nav.style.backdropFilter = 'blur(16px)';
    nav.style.boxShadow      = '0 1px 0 rgba(255,255,255,.06)';
    nav.style.padding        = '16px 3vw';
  } else {
    nav.style.background     = 'linear-gradient(to bottom,rgba(4,6,10,.7),transparent)';
    nav.style.backdropFilter = 'none';
    nav.style.boxShadow      = 'none';
    nav.style.padding        = '24px 3vw';
  }
}, { passive: true });

/* === SCROLL REVEAL === */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

/* === CALCULATOR === */
function fmt(n) { return '$' + n.toLocaleString(); }

function updateCalc() {
  const p = projData[currentProj];
  let min = p.min, max = p.max, mMin = 0, mMax = 0;

  calcAddons.forEach(btn => {
    const key = btn.dataset.addon;
    const excluded = p.excludes === key;
    btn.classList.toggle('disabled', excluded);
    if (excluded) addonState[key] = false;
    const on = addonState[key] && !excluded;
    btn.classList.toggle('active', on);
    btn.querySelector('.check-icon').classList.toggle('on', on);
  });

  Object.keys(addonState).forEach(key => {
    if (addonState[key] && p.excludes !== key) {
      const a = addonData[key];
      min  += a.min;  max  += a.max;
      mMin += a.mMin; mMax += a.mMax;
    }
  });

  calcPriceEl.textContent = min === max ? fmt(min) : fmt(min) + ' – ' + fmt(max);

  if (mMax > 0) {
    calcMonthlyEl.textContent  = '+ ' + fmt(mMin) + '–' + fmt(mMax) + '/mo';
    calcMonthlyWrap.style.display = 'block';
  } else {
    calcMonthlyWrap.style.display = 'none';
  }
}

calcBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentProj = btn.dataset.type;
    calcBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCalc();
  });
});

calcAddons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) return;
    const key = btn.dataset.addon;
    addonState[key] = !addonState[key];
    updateCalc();
  });
});

updateCalc();

/* === QUOTE SUMMARY CARD === */
getQuoteBtn.addEventListener('click', () => {
  const p = projData[currentProj];
  const priceText = calcPriceEl.textContent;
  const monthly   = calcMonthlyEl.textContent;
  const activeAddons = Object.keys(addonState)
    .filter(k => addonState[k] && p.excludes !== k)
    .map(k => addonData[k].label);

  quoteProjectIn.value = p.label;
  quotePriceIn.value   = priceText;
  quoteAddonsIn.value  = activeAddons.join(', ');
  quoteMonthlyIn.value = monthly;

  let html = `<div class="quote-row"><span>Project Type</span><strong>${p.label}</strong></div>`;
  html    += `<div class="quote-row"><span>Estimated Range</span><strong>${priceText}</strong></div>`;
  if (activeAddons.length) html += `<div class="quote-row"><span>Add-ons</span><strong>${activeAddons.join(', ')}</strong></div>`;
  if (monthly) html += `<div class="quote-row"><span>Maintenance</span><strong>${monthly}</strong></div>`;

  quoteSummaryBody.innerHTML = html;
  quoteSummary.style.display = 'block';
  if (!messageField.value.trim()) messageField.placeholder = 'Any extra details or questions for me?';
});

/* === PHONE FORMATTER === */
document.getElementById('phone').addEventListener('input', e => {
  const d = e.target.value.replace(/\D/g, '').slice(0, 10);
  let f = '';
  if (d.length > 6)      f = `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  else if (d.length > 3) f = `(${d.slice(0,3)}) ${d.slice(3)}`;
  else if (d.length > 0) f = `(${d}`;
  e.target.value = f;
});

/* === FORM VALIDATION === */
function showErr(field, msg) {
  const wrap = field.closest('.field-wrap');
  wrap.classList.add('field-invalid');
  let err = wrap.querySelector('.form-err');
  if (!err) {
    err = document.createElement('span');
    err.className = 'form-err';
    wrap.appendChild(err);
  }
  err.textContent = msg;
}

function clearErr(field) {
  const wrap = field.closest('.field-wrap');
  wrap.classList.remove('field-invalid');
  const err = wrap.querySelector('.form-err');
  if (err) err.remove();
}

function validateField(field) {
  if (field.validity.valid) { clearErr(field); return true; }
  if (field.validity.typeMismatch && field.type === 'email') {
    showErr(field, 'Please enter a valid email address.');
  } else {
    const label = field.closest('.field-wrap').querySelector('label').textContent.replace(' (optional)', '');
    showErr(field, `Please enter your ${label.toLowerCase()}.`);
  }
  return false;
}

const requiredFields = contactForm.querySelectorAll('[required]');
requiredFields.forEach(f => {
  f.addEventListener('input', () => clearErr(f));
  f.addEventListener('blur',  () => validateField(f));
});

/* === FORM SUBMIT === */
contactForm.addEventListener('submit', e => {
  e.preventDefault();

  let valid = true;
  requiredFields.forEach(f => { if (!validateField(f)) valid = false; });
  if (!valid) {
    contactForm.querySelector('.field-invalid input, .field-invalid textarea')?.focus();
    return;
  }

  const btn  = document.getElementById('submitBtn');
  const orig = btn.textContent;
  btn.disabled    = true;
  btn.textContent = 'Sending...';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(e.target)).toString(),
  })
  .then(() => {
    btn.textContent  = '✓ Message Sent!';
    btn.style.background = '#28c840';
    btn.style.boxShadow  = '0 0 24px rgba(40,200,64,.4)';
    setTimeout(() => {
      btn.textContent      = orig;
      btn.style.background = '';
      btn.style.boxShadow  = '';
      btn.disabled         = false;
      e.target.reset();
      quoteSummary.style.display = 'none';
      quoteSummaryBody.innerHTML  = '';
      messageField.placeholder    = 'Tell me about your project...';
    }, 3200);
  })
  .catch(() => {
    btn.textContent      = 'Something went wrong. Try again.';
    btn.style.background = '#e53e3e';
    btn.disabled         = false;
  });
});
