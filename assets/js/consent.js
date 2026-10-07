(()=>{
  const key='armazem-privacy-choice-v1';
  const banner=document.getElementById('privacyBanner');
  if(!banner) return;

  const read=()=>{try{return localStorage.getItem(key)}catch{return null}};
  const write=value=>{try{localStorage.setItem(key,value)}catch{}};
  const open=()=>{banner.hidden=false;requestAnimationFrame(()=>banner.querySelector('[data-privacy-accept]')?.focus())};
  const close=()=>{banner.hidden=true};

  if(!read()) open();

  document.querySelectorAll('[data-privacy-accept]').forEach(button=>{
    button.addEventListener('click',()=>{write('essential-only');close()});
  });

  document.querySelectorAll('[data-privacy-open]').forEach(button=>{
    button.addEventListener('click',()=>{
      try{localStorage.removeItem(key)}catch{}
      open();
    });
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !banner.hidden) close();
  });
})();