/* === PARTICLE CANVAS BACKGROUND === */
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');

let W, H, particles = [];
const COUNT    = 70;
const MAX_DIST = 130;
let mouse = { x: -9999, y: -9999 };

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();

function makeParticle() {
  return {
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r:  Math.random() * 1.8 + 0.8,
    a:  Math.random() * 0.45 + 0.15,
  };
}
function initParticles() {
  particles = Array.from({ length: COUNT }, makeParticle);
}
initParticles();

window.addEventListener('resize', () => { resize(); initParticles(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

function draw() {
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    /* mild mouse repulsion */
    const mdx = p.x - mouse.x;
    const mdy = p.y - mouse.y;
    const md  = Math.sqrt(mdx * mdx + mdy * mdy);
    if (md < 100) {
      const force = (100 - md) / 100 * 0.008;
      p.vx += (mdx / md) * force;
      p.vy += (mdy / md) * force;
    }

    /* clamp speed */
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 0.7) { p.vx = (p.vx / speed) * 0.7; p.vy = (p.vy / speed) * 0.7; }

    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    /* draw connections */
    for (let j = i + 1; j < particles.length; j++) {
      const q   = particles[j];
      const dx  = p.x - q.x;
      const dy  = p.y - q.y;
      const dst = Math.sqrt(dx * dx + dy * dy);
      if (dst < MAX_DIST) {
        const alpha = (1 - dst / MAX_DIST) * 0.18;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    /* draw dot */
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,212,255,${p.a})`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();


/* === TYPING EFFECT === */
const phrases = [
  'That Convert.',
  'That Impress.',
  'That Perform.',
  'That Grow Your Business.',
];
let phraseIdx  = 0;
let charIdx    = 0;
let deleting   = false;
const typedEl  = document.getElementById('typedText');

/* inject cursor style once */
const cursorStyle = document.createElement('style');
cursorStyle.textContent = '.cursor{display:inline-block;width:3px;height:0.85em;background:currentColor;vertical-align:middle;margin-left:2px;animation:blink 0.65s step-start infinite}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
document.head.appendChild(cursorStyle);

function type() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    typedEl.innerHTML = current.substring(0, charIdx + 1) + '<span class="cursor"></span>';
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { deleting = true; type(); }, 1900);
      return;
    }
    setTimeout(type, 75);
  } else {
    typedEl.innerHTML = current.substring(0, charIdx - 1) + '<span class="cursor"></span>';
    charIdx--;
    if (charIdx === 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
    setTimeout(type, 42);
  }
}
setTimeout(type, 1400);


/* === NAV SCROLL STATE === */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });


/* === MOBILE HAMBURGER === */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let   menuOpen   = false;

function toggleMenu(open) {
  menuOpen = open;
  mobileMenu.classList.toggle('open', menuOpen);
  const [s0, s1, s2] = hamburger.querySelectorAll('span');
  if (menuOpen) {
    s0.style.transform = 'rotate(45deg) translate(5px, 5px)';
    s1.style.opacity   = '0';
    s2.style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    s0.style.transform = s2.style.transform = '';
    s1.style.opacity   = '';
  }
}

hamburger.addEventListener('click', () => toggleMenu(!menuOpen));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));


/* === SCROLL REVEAL (IntersectionObserver) === */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
revealEls.forEach(el => revealObs.observe(el));


/* === ACTIVE NAV LINK ON SCROLL === */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => sectionObs.observe(s));

/* Add active link style */
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = '.nav-links a.active:not(.nav-cta){color:#e2e2e8!important}';
document.head.appendChild(activeLinkStyle);


/* === PHONE FORMATTER === */
document.getElementById('phone').addEventListener('input', e => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
  let formatted = '';
  if (digits.length > 6)      formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  else if (digits.length > 3) formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  else if (digits.length > 0) formatted = `(${digits}`;
  e.target.value = formatted;
});

/* === CONTACT FORM === */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending...';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(e.target)).toString()
  })
  .then(() => {
    btn.textContent = 'Message Sent!';
    btn.style.background = '#28c840';
    btn.style.boxShadow  = '0 0 24px rgba(40,200,64,0.4)';
    setTimeout(() => {
      btn.textContent      = orig;
      btn.style.background = '';
      btn.style.boxShadow  = '';
      btn.disabled = false;
      e.target.reset();
    }, 3200);
  })
  .catch(() => {
    btn.textContent = 'Something went wrong. Try again.';
    btn.style.background = '#e53e3e';
    btn.disabled = false;
  });
});
