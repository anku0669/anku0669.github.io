(function(){
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav');
  if(toggle&&nav){toggle.addEventListener('click',function(){const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
  const progress=document.querySelector('.scroll-progress');
  const updateProgress=function(){if(!progress)return;const doc=document.documentElement;const max=doc.scrollHeight-window.innerHeight;progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%';};
  window.addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const obs=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);}});},{threshold:.08});
    reveals.forEach(function(el){obs.observe(el);});
  }else{reveals.forEach(function(el){el.classList.add('visible');});}
  const search=document.getElementById('sourceSearch');
  if(search){const entries=Array.from(document.querySelectorAll('.source-entry'));const count=document.getElementById('sourceCount');const filter=function(){const q=search.value.toLowerCase().trim();let shown=0;entries.forEach(function(entry){const hay=(entry.innerText+' '+(entry.dataset.search||'')).toLowerCase();const match=!q||hay.includes(q);entry.classList.toggle('is-hidden',!match);if(match)shown++;});if(count)count.textContent=shown+' of '+entries.length+' sources';};search.addEventListener('input',filter);}
})();