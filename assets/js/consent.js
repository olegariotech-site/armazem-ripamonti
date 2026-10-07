(()=>{
  const key='armazem-privacy-choice-v1';
  const banner=document.getElementById('privacyBanner');
  if(!banner) return;

  const read=()=>{try{return localStorage.getItem(key)}catch{return null}};
  const write=value=>{try{localStorage.setItem(key,value)}catch{}};
  let opener=null;
  const open=button=>{
    opener=button||null;
    banner.hidden=false;
    if(opener) requestAnimationFrame(()=>{
      if(!banner.hidden) banner.querySelector('[data-privacy-accept]')?.focus({preventScroll:true});
    });
  };
  const close=()=>{
    const focusInside=banner.contains(document.activeElement);
    banner.hidden=true;
    if(focusInside){
      if(opener?.isConnected) opener.focus({preventScroll:true});
      else document.activeElement.blur();
    }
    opener=null;
  };

  if(!read()) open();

  document.querySelectorAll('[data-privacy-accept]').forEach(button=>{
    button.addEventListener('click',()=>{write('essential-only');close()});
  });

  document.querySelectorAll('[data-privacy-open]').forEach(button=>{
    button.addEventListener('click',()=>open(button));
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !banner.hidden) close();
  });
})();
