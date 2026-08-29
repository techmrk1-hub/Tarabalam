(function(){
 const nav=document.querySelector('.primary-nav');
 const btn=document.querySelector('.mobile-menu-btn');
 btn?.addEventListener('click',()=>nav.classList.toggle('open'));
 document.querySelectorAll('.nav-item.has-menu>.nav-link').forEach(a=>a.addEventListener('click',e=>{
   if(innerWidth<=760){e.preventDefault();a.parentElement.classList.toggle('open');}
 }));
})();
