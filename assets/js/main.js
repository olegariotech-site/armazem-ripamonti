document.documentElement.classList.add('js');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileViewport = window.matchMedia('(max-width: 760px)');
const particleControllers = new Map();
let finishIntro = () => {};

function runIntro(){
  const intro = document.getElementById('intro');
  if(!intro) return;
  let seen = false;
  try{ seen = sessionStorage.getItem('armazem-intro-seen'); }catch{}
  if(seen || motionPreference.matches){ intro.remove(); return; }
  document.body.classList.add('intro-active');
  try{ sessionStorage.setItem('armazem-intro-seen', '1'); }catch{}
  const duration = mobileViewport.matches ? 1800 : 2800;
  let removalTimer;
  const closeTimer = setTimeout(() => {
    intro.classList.add('is-done');
    document.body.classList.remove('intro-active');
    particleControllers.get('introParticles')?.destroy();
    removalTimer = setTimeout(() => intro.remove(), 800);
  }, duration);
  finishIntro = () => {
    clearTimeout(closeTimer);
    clearTimeout(removalTimer);
    document.body.classList.remove('intro-active');
    particleControllers.get('introParticles')?.destroy();
    intro.remove();
  };
}

function particles(canvas, options = {}){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(!ctx) return;
  let w = 0, h = 0, dpr = 1, items = [], frame = 0, previous = 0;
  let visible = false, destroyed = false;
  const resize = () => {
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextW = canvas.clientWidth, nextH = canvas.clientHeight;
    if(w === nextW && h === nextH && dpr === nextDpr && items.length) return;
    w = nextW; h = nextH; dpr = nextDpr;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = mobileViewport.matches ? options.mobileCount : options.count;
    items = Array.from({length: count}, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4,
      vx: (Math.random() - .5) * .18, vy: -(Math.random() * .28 + .08), a: Math.random() * .55 + .15
    }));
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const draw = timestamp => {
    frame = 0;
    if(!canvas.isConnected){ destroy(); return; }
    if(!visible || document.hidden || motionPreference.matches) return;
    const step = previous ? Math.min((timestamp - previous) / (1000 / 60), 2) : 1;
    previous = timestamp;
    ctx.clearRect(0, 0, w, h);
    for(const p of items){
      p.x += p.vx * step; p.y += p.vy * step;
      if(p.y < -10){ p.y = h + 10; p.x = Math.random() * w; }
      if(p.x < -10) p.x = w + 10;
      if(p.x > w + 10) p.x = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${options.color},${p.a})`; ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  };
  const sync = () => {
    if(destroyed) return;
    if(!canvas.isConnected){ destroy(); return; }
    stop();
    if(motionPreference.matches){ ctx.clearRect(0, 0, w, h); return; }
    resize();
    if(visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  const destroy = () => {
    if(destroyed) return;
    destroyed = true;
    stop(); observer.disconnect();
    removeEventListener('resize', sync);
    document.removeEventListener('visibilitychange', sync);
    particleControllers.delete(canvas.id);
  };
  particleControllers.set(canvas.id, {sync, destroy});
  observer.observe(canvas);
  addEventListener('resize', sync, {passive: true});
  document.addEventListener('visibilitychange', sync);
}

function reveals(){
  const els = [...document.querySelectorAll('.reveal')];
  const showAll = () => els.forEach(el => el.classList.add('is-visible'));
  if(motionPreference.matches || !('IntersectionObserver' in window)){ showAll(); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, {threshold: .12});
  els.forEach(el => io.observe(el));
  motionPreference.addEventListener('change', event => {
    if(event.matches){ io.disconnect(); showAll(); }
  });
}

function scrollUI(){
  const progress = document.querySelector('.scroll-progress span');
  const header = document.querySelector('.site-header');
  const back = document.getElementById('backTop');
  const bg = document.querySelector('.hero-bg');
  const hero = document.querySelector('.hero');
  const links = [...document.querySelectorAll('.scene-rail a[data-scene]')];
  const sections = links.map(link => document.getElementById(link.dataset.scene)).filter(Boolean);
  let frame = 0;
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if(progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    header?.classList.toggle('scrolled', scrollY > 40);
    if(back){
      const visible = scrollY > 700;
      back.classList.toggle('visible', visible);
      back.disabled = !visible;
    }
    if(bg){
      if(motionPreference.matches || mobileViewport.matches){ bg.style.transform = 'none'; }
      else if(scrollY < (hero?.offsetHeight || innerHeight) * 1.2){
        bg.style.transform = `scale(1.035) translateY(${scrollY * .085}px)`;
      }
    }
    const probe = innerHeight * .42;
    let current = sections[0]?.id;
    for(const section of sections){
      const rect = section.getBoundingClientRect();
      if(rect.top <= probe) current = section.id;
      if(rect.top <= probe && rect.bottom > probe) break;
    }
    links.forEach(link => {
      const active = link.dataset.scene === current;
      link.classList.toggle('active', active);
      if(active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if(!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule, {passive: true});
  addEventListener('pageshow', schedule);
  addEventListener('load', schedule);
  motionPreference.addEventListener('change', schedule);
  mobileViewport.addEventListener('change', schedule);
  back?.addEventListener('click', () => scrollTo({top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth'}));
  update();
}

const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();
runIntro();
if('IntersectionObserver' in window){
  particles(document.getElementById('introParticles'), {count: 42, mobileCount: 18, color: '255,196,0'});
  particles(document.getElementById('heroParticles'), {count: 20, mobileCount: 8, color: '255,196,0'});
  particles(document.getElementById('coldParticles'), {count: 12, mobileCount: 5, color: '255,255,255'});
}
reveals();
scrollUI();
motionPreference.addEventListener('change', event => {
  if(event.matches) finishIntro();
  particleControllers.forEach(controller => controller.sync());
});
