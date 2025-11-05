<!-- ===================== PARTE 2 - JAVASCRIPT ===================== -->
<script>
/* ==========================================================================
   DOMINA ACADEMY — PART 2 SCRIPT
   - Offcanvas toggle
   - Dropdown accessibility
   - Modal open/close
   - Theme toggle (persistent)
   - Sticky CTA visibility (IntersectionObserver)
   - Particles (canvas)
   - Parallax simple
   - Carousel simple (touch + arrows)
   - Tooltip toggle
   - Form validation
   ========================================================================== */
(function(){
  'use strict';

  /* -----------------------------
     Helpers
  ------------------------------*/
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const on = (elem, ev, fn) => elem && elem.addEventListener(ev, fn);
  const createEl = (tag, attrs={}) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='html') el.innerHTML=v;
      else el.setAttribute(k,v);
    });
    return el;
  };

  /* -----------------------------
     OFFCANVAS (mobile menu)
  ------------------------------*/
  function initOffcanvas() {
    const hamb = document.querySelector('.hamburger');
    const off = document.querySelector('.offcanvas');
    const overlay = document.querySelector('.offcanvas-overlay');
    if(!hamb || !off) return;

    function open(){ off.classList.add('open'); document.body.style.overflow='hidden'; overlay.style.display='block'; setTimeout(()=>overlay.classList.add('visible'),10); }
    function close(){ off.classList.remove('open'); document.body.style.overflow=''; overlay.classList.remove('visible'); setTimeout(()=>overlay.style.display='none', 300); }

    hamb.addEventListener('click', ()=> {
      open();
    });
    const closeBtn = off.querySelector('.close-btn');
    if(closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    // trap focus (basic)
    off.addEventListener('keydown', (e)=>{
      if(e.key==='Escape') close();
    });
  }

  /* -----------------------------
     DROPDOWNS (aria + trap)
  ------------------------------*/
  function initDropdowns() {
    $$('.dropdown-toggle').forEach(toggle => {
      const root = toggle.closest('.dropdown');
      const menu = root.querySelector('.dropdown-menu');
      toggle.setAttribute('aria-expanded','false');
      toggle.addEventListener('click', e=>{
        const isOpen = root.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        if(isOpen) {
          // focus first link
          const first = menu.querySelector('a, button, [tabindex]');
          first && first.focus();
        }
      });
      // close on outside click
      document.addEventListener('click', e=>{
        if(!root.contains(e.target)) {
          root.classList.remove('open');
          toggle.setAttribute('aria-expanded','false');
        }
      });
    });
  }

  /* -----------------------------
     MODAL (simple)
  ------------------------------*/
  function initModals() {
    const modalBackdrop = createEl('div', { class: 'modal-backdrop', id: 'global-modal' });
    modalBackdrop.innerHTML = `<div class="modal-window" role="dialog" aria-modal="true"><div class="modal-header"><strong id="modal-title">Aviso</strong><button class="close-modal" aria-label="Fechar">✕</button></div><div class="modal-body"><p id="modal-body">Conteúdo</p></div><div class="modal-footer"><button class="btn btn-outline close-modal">Fechar</button><button class="btn btn-cta confirm-modal">Confirmar</button></div></div>`;
    document.body.appendChild(modalBackdrop);

    function openModal(title, html, onConfirm) {
      $('#modal-title').textContent = title || 'Aviso';
      $('#modal-body').innerHTML = html || '';
      modalBackdrop.classList.add('open');
      document.body.style.overflow='hidden';

      const closeEls = modalBackdrop.querySelectorAll('.close-modal');
      closeEls.forEach(el=>el.addEventListener('click', closeModal));
      modalBackdrop.querySelector('.confirm-modal').onclick = ()=>{
        closeModal();
        onConfirm && onConfirm();
      };
      modalBackdrop.addEventListener('click', (e)=>{ if(e.target===modalBackdrop) closeModal(); });
      modalBackdrop.addEventListener('keydown', (e)=> { if(e.key==='Escape') closeModal(); });
    }
    function closeModal(){ modalBackdrop.classList.remove('open'); document.body.style.overflow=''; }

    // expose on window for demos
    window.DominaModal = openModal;
  }

  /* -----------------------------
     THEME TOGGLE (persist)
  ------------------------------*/
  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if(!toggle) return;
    const current = localStorage.getItem('domina-theme');
    if(current==='light') document.body.classList.add('light-mode');

    toggle.addEventListener('click', ()=>{
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('domina-theme', isLight ? 'light' : 'dark');
      // small a11y feedback
      toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
  }

  /* -----------------------------
     STICKY CTA (IntersectionObserver)
     Shows sticky CTA when hero is out of view
  ------------------------------*/
  function initStickyCta() {
    const hero = document.querySelector('.hero');
    const sticky = document.querySelector('.sticky-cta');
    if(!hero || !sticky) return;
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting) sticky.classList.remove('show');
        else sticky.classList.add('show');
      });
    }, { root: null, threshold: 0, rootMargin: "-10% 0px -70% 0px" });
    observer.observe(hero);
    // click behavior - scroll or open modal
    sticky.addEventListener('click', (ev)=>{
      ev.preventDefault();
      // call modal or go to vip anchor
      const vip = document.querySelector('#vip');
      if(vip) vip.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* -----------------------------
     PARTICLES (canvas) — lightweight
  ------------------------------*/
  function initParticles() {
    // create canvas element under body at top of page (behind hero)
    const canvas = createEl('canvas', { class: 'particles-canvas', 'aria-hidden':'true' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight * 0.65; // only upper portion (hero)
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 0;
    const particles = [];
    const count = Math.max(20, Math.floor(w / 80));
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.6 + 0.6,
        vx: (Math.random()-0.5) * 0.3,
        vy: (Math.random()-0.1) * 0.3,
        alpha: 0.05 + Math.random()*0.35
      });
    }

    function draw() {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < -10) p.x = w + 10;
        if(p.x > w + 10) p.x = -10;
        if(p.y < -10) p.y = h + 10;
        if(p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,255,240,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', ()=>{ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight * 0.65; });
  }

  /* -----------------------------
     PARALLAX (simple) — updates CSS var --parallax-y on container
  ------------------------------*/
  function initParallax() {
    const paras = $$('.parallax');
    if(!paras.length) return;
    function update(){
      paras.forEach(el=>{
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.18');
        const y = (window.innerHeight - rect.top) * speed;
        el.style.setProperty('--parallax-y', y + 'px');
      });
    }
    update();
    window.addEventListener('scroll', () => { window.requestAnimationFrame(update); });
    window.addEventListener('resize', () => { window.requestAnimationFrame(update); });
  }

  /* -----------------------------
     CAROUSEL (touch + arrows)
  ------------------------------*/
  function initCarousels() {
    $$('.carousel-wrap').forEach(wrap=>{
      const track = wrap.querySelector('.carousel-track');
      const left = wrap.querySelector('.carousel-arrow.left');
      const right = wrap.querySelector('.carousel-arrow.right');
      if(!track) return;
      let index = 0;
      const items = track.children;
      const perView = Math.max(1, Math.floor(wrap.offsetWidth / 280));
      function update(){ track.style.transform = `translateX(-${index * (items[0].offsetWidth + 16)}px)`; }
      if(right) right.addEventListener('click', ()=>{ index = Math.min(index+1, items.length-1); update();});
      if(left) left.addEventListener('click', ()=>{ index = Math.max(index-1, 0); update();});
      // touch support
      let startX = null, currentX = null;
      track.addEventListener('touchstart', e=> { startX = e.touches[0].clientX; });
      track.addEventListener('touchmove', e=> { if(!startX) return; currentX = e.touches[0].clientX; });
      track.addEventListener('touchend', e=> {
        if(startX === null || currentX === null) { startX = currentX = null; return; }
        const diff = startX - currentX;
        if(Math.abs(diff) > 40) { if(diff > 0) index = Math.min(index+1, items.length-1); else index = Math.max(index-1, 0); update(); }
        startX = currentX = null;
      });
      // initial update
      setTimeout(update, 120);
      window.addEventListener('resize', update);
    });
  }

  /* -----------------------------
     TOOLTIP (data-tooltip) — hover + focus handling
  ------------------------------*/
  function initTooltips() {
    $$('[data-tooltip]').forEach(el=>{
      let timer;
      function show(){ el.classList.add('tooltip-visible'); }
      function hide(){ el.classList.remove('tooltip-visible'); }
      el.addEventListener('mouseenter', ()=>{ timer = setTimeout(show, 60); });
      el.addEventListener('mouseleave', ()=>{ clearTimeout(timer); hide(); });
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);
    });
  }

  /* -----------------------------
     FORM VALIDATION (basic)
  ------------------------------*/
  function initForms() {
    $$('form').forEach(form=>{
      form.addEventListener('submit', e=>{
        const inputs = $$('.input', form);
        let valid = true;
        inputs.forEach(inp=>{
          if(inp.required && !inp.value.trim()){
            inp.classList.add('invalid');
            valid = false;
          } else {
            inp.classList.remove('invalid');
            inp.classList.add('valid');
          }
        });
        if(!valid){
          e.preventDefault();
          // show modal with message
          window.DominaModal && window.DominaModal('Erro', '<p>Por favor, preencha os campos obrigatórios.</p>');
        } else {
          // show loading state on submit btn if present
          const submitBtn = form.querySelector('button[type="submit"], .btn');
          if(submitBtn){
            submitBtn.classList.add('is-loading');
            setTimeout(()=> submitBtn.classList.remove('is-loading'), 2500);
          }
        }
      });
    });
  }

  /* -----------------------------
     FAQ: improve keyboard + a11y
  ------------------------------*/
  function initFAQ() {
    $$('.faq-item').forEach(item=>{
      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', ()=> item.classList.toggle('open'));
      btn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') item.classList.toggle('open'); });
    });
  }

  /* -----------------------------
     CARDS: buy confirmation (demo)
  ------------------------------*/
  function initBuyButtons() {
    $$('.btn-buy, .btn-primary.buy, .btn-cta.buy').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        const title = 'Confirmar Compra';
        const html = '<p>Deseja realmente comprar este produto agora? Clique confirmar para prosseguir.</p>';
        window.DominaModal && window.DominaModal(title, html, ()=> {
          // simulate success
          const successHtml = '<p>Compra efetuada com sucesso! Verifique seu email para o acesso.</p>';
          window.DominaModal && window.DominaModal('Sucesso', successHtml);
        });
      });
    });
  }

  /* -----------------------------
     INITIALIZE ALL
  ------------------------------*/
  function initAll() {
    initOffcanvas();
    initDropdowns();
    initModals();
    initThemeToggle();
    initStickyCta();
    initParticles();
    initParallax();
    initCarousels();
    initTooltips();
    initForms();
    initFAQ();
    initBuyButtons();
  }

  // wait DOM
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

  /* ===================== END PART 2 SCRIPT ===================== */
})();

/* ===================== PARTE 3 — JS FINAL ===================== */
(function(){
  'use strict';

  // ------------------- Loader -------------------
  const loader = document.createElement('div');
  loader.className = 'loader-overlay';
  loader.innerHTML = `<div class="loader-logo brand-scan">DOMINA ACADEMY</div>`;
  document.body.appendChild(loader);
  window.addEventListener('load', ()=> {
    setTimeout(()=> loader.classList.add('hidden'), 800);
    setTimeout(()=> loader.remove(), 1600);
  });

  // ------------------- Scroll Reveal -------------------
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(r => observer.observe(r));

  // ------------------- Click Tracking -------------------
  function track(eventName, details={}) {
    console.log('TrackEvent:', eventName, details);
    // Aqui pode ser substituído por dataLayer.push() ou fetch para analytics
  }

  document.querySelectorAll('.btn-buy, .btn-cta').forEach(btn=>{
    btn.addEventListener('click',()=>{
      track('click_buy_button',{label:btn.textContent.trim()});
    });
  });

  // ------------------- Badge Injection -------------------
  document.querySelectorAll('.product-card').forEach((card,i)=>{
    const badge = document.createElement('div');
    badge.className = 'trust-badge u-fade-in';
    badge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Garantido`;
    if(i%2===0) card.prepend(badge);
  });

  // ------------------- Scroll CTA pulse -------------------
  const cta = document.querySelector('.btn-cta');
  if(cta){
    window.addEventListener('scroll',()=>{
      const y = window.scrollY;
      cta.style.boxShadow = y>300 ? '0 0 40px rgba(0,255,240,0.15)' : '';
    });
  }

  // ------------------- Animate Headings -------------------
  const titles = document.querySelectorAll('h1,h2,h3');
  titles.forEach(t=>{
    t.classList.add('brand-scan');
  });

})();

</script>