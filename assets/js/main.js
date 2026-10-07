document.documentElement.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;

function runIntro(){
  const intro=document.getElementById('intro');
  if(!intro) return;
  let seen=false;
  try{seen=sessionStorage.getItem('armazem-intro-seen')}catch{}
  if(seen || reduced){
    intro.remove();
    return;
  }
  document.body.classList.add('intro-active');
  try{sessionStorage.setItem('armazem-intro-seen','1')}catch{}
  setTimeout(()=>{
    intro.classList.add('is-done');
    document.body.classList.remove('intro-active');
  }, mobile ? 1800 : 2800);
  setTimeout(()=>intro.remove(), mobile ? 2500 : 3600);
}

function particles(canvas,options={}){
  if(!canvas || reduced) return;
  const ctx=canvas.getContext('2d');
  const count=options.count || (mobile?22:52);
  const color=options.color || '255,196,0';
  let w=0,h=0,dpr=Math.min(window.devicePixelRatio||1,2),items=[];
  const resize=()=>{
    w=canvas.clientWidth;h=canvas.clientHeight;
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    items=Array.from({length:count},()=>({
      x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.6+.4,
      vx:(Math.random()-.5)*.18,vy:-(Math.random()*.28+.08),a:Math.random()*.55+.15
    }));
  };
  const draw=()=>{
    if(!canvas.isConnected) return;
    ctx.clearRect(0,0,w,h);
    for(const p of items){
      p.x+=p.vx;p.y+=p.vy;
      if(p.y<-10){p.y=h+10;p.x=Math.random()*w}
      if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${color},${p.a})`;ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  resize();window.addEventListener('resize',resize,{passive:true});draw();
}

function reveals(){
  const els=[...document.querySelectorAll('.reveal')];
  if(reduced){els.forEach(el=>el.classList.add('is-visible'));return}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const delay=Number(entry.target.dataset.delay||0);
        setTimeout(()=>entry.target.classList.add('is-visible'),delay);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.12});
  els.forEach(el=>io.observe(el));
}

function scrollUI(){
  const progress=document.querySelector('.scroll-progress span');
  const header=document.querySelector('.site-header');
  const back=document.getElementById('backTop');
  const update=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    const ratio=max>0?scrollY/max:0;
    if(progress) progress.style.width=`${ratio*100}%`;
    if(header) header.classList.toggle('scrolled',scrollY>40);
    if(back) back.classList.toggle('visible',scrollY>700);
  };
  addEventListener('scroll',update,{passive:true});update();
  back?.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
}

function parallax(){
  if(reduced || mobile) return;
  const bg=document.querySelector('.hero-bg');
  const onScroll=()=>{
    if(bg && scrollY<innerHeight*1.2){
      bg.style.transform=`scale(1.035) translateY(${scrollY*.085}px)`;
    }
  };
  addEventListener('scroll',onScroll,{passive:true});
}

document.getElementById('year').textContent=new Date().getFullYear();
runIntro();
particles(document.getElementById('introParticles'),{count:mobile?28:70,color:'255,196,0'});
particles(document.getElementById('heroParticles'),{count:mobile?15:42,color:'255,196,0'});
particles(document.getElementById('coldParticles'),{count:mobile?12:32,color:'82,199,255'});
reveals();
scrollUI();
parallax();
