(function(){
  'use strict';
  const $=function(selector,root){return (root||document).querySelector(selector);};
  const $$=function(selector,root){return Array.from((root||document).querySelectorAll(selector));};
  const toggle=$('.menu-toggle');
  const nav=$('.nav');
  if(toggle&&nav){
    toggle.addEventListener('click',function(){
      const open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close navigation':'Toggle navigation');
    });
    nav.addEventListener('click',function(event){
      if(event.target.closest('a')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&nav.classList.contains('open')){
        nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();
      }
    });
  }

  const progress=$('.scroll-progress');
  let scrollPending=false;
  const updateProgress=function(){
    if(!progress)return;
    const doc=document.documentElement;
    const max=doc.scrollHeight-window.innerHeight;
    progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%';
    scrollPending=false;
  };
  window.addEventListener('scroll',function(){
    if(!scrollPending){window.requestAnimationFrame(updateProgress);scrollPending=true;}
  },{passive:true});
  updateProgress();

  function revealWithMotion(gsap){
    const nodes=$$('.reveal');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced||!('IntersectionObserver' in window)){
      nodes.forEach(function(node){node.classList.add('visible');node.style.opacity='1';node.style.transform='none';});
      return;
    }
    const observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        const node=entry.target;
        observer.unobserve(node);
        if(gsap){
          gsap.fromTo(node,{y:24,autoAlpha:0,filter:'blur(3px)'},{
            y:0,autoAlpha:1,filter:'blur(0px)',duration:.8,ease:'power3.out',
            onComplete:function(){node.style.removeProperty('filter');}
          });
        }else{
          node.classList.add('visible');
        }
      });
    },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
    nodes.forEach(function(node){observer.observe(node);});
  }

  function initMotion(gsap){
    if(!gsap){revealWithMotion(null);return;}
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){revealWithMotion(gsap);return;}
    const hero=$('.page-hero');
    if(hero){gsap.from(hero,{y:17,autoAlpha:0,duration:.75,ease:'power3.out',clearProps:'transform'});}
    revealWithMotion(gsap);
    const glowTargets=$$('.metric-card,.feature-card,.pathway-card,.dataset-card,.model-card,.source-entry,.action-row');
    if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      glowTargets.forEach(function(card){
        card.addEventListener('pointermove',function(event){
          const rect=card.getBoundingClientRect();
          card.style.setProperty('--spot-x',(event.clientX-rect.left)+'px');
          card.style.setProperty('--spot-y',(event.clientY-rect.top)+'px');
        });
      });
    }
    const heroVisual=$('.hero-visual');
    const planet=$('.planet');
    if(heroVisual&&planet&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      heroVisual.addEventListener('pointermove',function(event){
        const rect=heroVisual.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        gsap.to(planet,{x:x*7,y:y*7,duration:.6,ease:'power2.out',overwrite:true});
      });
      heroVisual.addEventListener('pointerleave',function(){
        gsap.to(planet,{x:0,y:0,duration:.7,ease:'power2.out',overwrite:true});
      });
    }
  }

  function loadMotion(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){initMotion(null);return;}
    if(window.gsap){initMotion(window.gsap);return;}
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js';
    script.async=true;
    script.onload=function(){initMotion(window.gsap||null);};
    script.onerror=function(){initMotion(null);};
    document.head.appendChild(script);
  }
  loadMotion();

  const search=$('#sourceSearch');
  if(search){
    const entries=$$('.source-entry');
    const count=$('#sourceCount');
    const filter=function(){
      const q=search.value.toLowerCase().trim();let shown=0;
      entries.forEach(function(entry){
        const hay=(entry.innerText+' '+(entry.dataset.search||'')).toLowerCase();
        const match=!q||hay.includes(q);
        entry.classList.toggle('is-hidden',!match);
        if(match)shown++;
      });
      if(count)count.textContent=shown+' of '+entries.length+' sources';
    };
    search.addEventListener('input',filter);
  }
})();