/* app.js — interatividade & automação
   - Smooth scroll
   - Mobile nav toggle (cria hamburger)
   - Scroll reveal (IntersectionObserver)
   - Active nav link update
   - Modal product / buy handler (M-Pesa + Hotmart + WhatsApp)
   - Basic form validation + feedback
   - Back-to-top show/hide
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ===== VARS ===== */
  const siteHeader = document.querySelector('.header-inner') || document.querySelector('header');
  const mainNav = document.querySelector('#main-nav');
  const navList = mainNav ? mainNav.querySelector('ul') : null;
  const navLinks = mainNav ? Array.from(mainNav.querySelectorAll('a[href^="#"]')) : [];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const templatesRoot = document.getElementById('modal-templates');
  const tplProduct = document.getElementById('tpl-product-modal');
  const tplWaitlist = document.getElementById('tpl-waitlist-confirm');

  /* ===== MOBILE HAMBURGER (auto insert) ===== */
  function createHamburger(){
    if (document.querySelector('.hamburger-icon')) return;
    const btn = document.createElement('button');
    btn.className = 'hamburger-icon';
    btn.setAttribute('aria-label', 'Abrir menu');
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.display = 'none';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.padding = '6px';
    // place in header
    const header = document.querySelector('.header-inner');
    if (header) {
      header.insertBefore(btn, header.children[1]);
      btn.style.display = '';
    }
    btn.addEventListener('click', () => {
      if (!navList) return;
      navList.classList.toggle('open');
      btn.classList.toggle('open');
    });
  }
  createHamburger();

  /* ===== SMOOTH SCROLL ===== */
  navLinks.forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - (siteHeader ? siteHeader.offsetHeight + 8 : 24);
      window.scrollTo({top: y, behavior: 'smooth'});
      // close mobile menu if open
      if (navList && navList.classList.contains('open')) navList.classList.remove('open');
    });
  });

  /* ===== ACTIVE NAV LINK ON SCROLL ===== */
  const obsOptions = { root: null, rootMargin: '0px 0px -35% 0px', threshold: 0 };
  const sectionObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
      if (entry.isIntersecting) {
        navLinks.forEach(n=>n.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, obsOptions);
  sections.forEach(s=>sectionObserver.observe(s));

  /* ===== SCROLL REVEAL (for elements with .is-hidden) ===== */
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('is-hidden');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  // init: mark elements
  document.querySelectorAll('.card, .hero-copy, .product, .course, .testimonial, .wrap > h2, .curriculum').forEach(el=>{
    if (!el.classList.contains('is-visible')) el.classList.add('is-hidden');
    revealObserver.observe(el);
  });

  /* ===== BACK TO TOP ===== */
  const backToTop = document.createElement('button');
  backToTop.id = 'back-to-top';
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);
  backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  window.addEventListener('scroll', ()=> {
    if (window.scrollY > 600) backToTop.style.display = 'block';
    else backToTop.style.display = 'none';
  });

  /* ===== MODAL HELPERS ===== */
  function openModal(node){
    node.classList.add('show');
    document.body.style.overflow = 'hidden';
    node.addEventListener('click', e => {
      if (e.target === node) closeModal(node);
    });
    const closeBtns = node.querySelectorAll('.modal-close');
    closeBtns.forEach(b => b.addEventListener('click', ()=> closeModal(node)));
  }
  function closeModal(node){
    node.classList.remove('show');
    document.body.style.overflow = '';
    node.remove();
  }

  /* ===== PRODUCT / BUY HANDLERS ===== */
  function createProductModal({title, desc, price, productId, whatsappMsg}){
    let tpl = tplProduct;
    if (!tpl) {
      // fallback modal
      const box = document.createElement('div');
      box.className = 'modal show';
      box.innerHTML = `<div class="modal-inner card"><button class="modal-close btn">Fechar</button><div class="modal-content"><h3>${title}</h3><p class="muted">${desc}</p><div class="modal-price">${price}</div><div style="margin-top:1rem;display:flex;gap:.6rem"><button class="btn-primary btn-buy-wp">Pagar via M-Pesa / WhatsApp</button><button class="btn-outline btn-hotmart">Comprar (Hotmart)</button></div></div></div>`;
      document.body.appendChild(box);
      box.querySelector('.btn-buy-wp').addEventListener('click', ()=> openWhatsApp(whatsappMsg || `Quero comprar: ${title} — ${price}`));
      box.querySelector('.btn-hotmart').addEventListener('click', ()=> {
        alert('Redirecionar para Hotmart (simulação).');
        closeModal(box);
      });
      return box;
    }
    const clone = tpl.content.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.className = 'modal show';
    wrapper.appendChild(clone);
    // populate
    wrapper.querySelector('.modal-title')?.replaceWith(Object.assign(document.createElement('h3'), {className:'modal-title', textContent:title}));
    wrapper.querySelector('.modal-desc')?.textContent = desc || '';
    const modalPrice = wrapper.querySelector('.modal-price');
    if(modalPrice) modalPrice.textContent = price || '';
    document.body.appendChild(wrapper);
    // handlers
    const btnWp = wrapper.querySelector('.modal-actions .btn-primary');
    const btnHot = wrapper.querySelector('.modal-actions .btn-outline');
    if (btnWp) btnWp.addEventListener('click', ()=> openWhatsApp(whatsappMsg || `Olá! Quero comprar: ${title} — ${price}. ID:${productId || ''}`));
    if (btnHot) btnHot.addEventListener('click', ()=> {
      alert('Redirecionar para Hotmart (simulação).');
      closeModal(wrapper);
    });
    // close
    wrapper.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click', ()=> closeModal(wrapper)));
    wrapper.addEventListener('click', e => { if (e.target === wrapper) closeModal(wrapper) });
    return wrapper;
  }

  function openWhatsApp(message){
    const phone = '258833869285'; // your number in html already
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  }

  // attach buy buttons
  document.querySelectorAll('[data-buy],[data-hotmart]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const el = e.currentTarget;
      const pid = el.dataset.buy || el.dataset.hotmart || el.getAttribute('data-product') || el.closest('.product')?.dataset?.id || '';
      const title = el.closest('.product')?.querySelector('h3')?.textContent
                    || el.closest('.card')?.querySelector('h3')?.textContent
                    || document.querySelector('.modal-title')?.textContent
                    || 'Produto';
      const desc = el.closest('.product')?.querySelector('p.muted')?.textContent || '';
      const price = el.closest('.product')?.querySelector('.price')?.textContent || el.closest('.card')?.querySelector('.price')?.textContent || '';
      createProductModal({title, desc, price, productId: pid});
    });
  });

  // general WhatsApp contact buttons
  document.querySelectorAll('[data-contact]').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const tag = btn.dataset.contact;
      openWhatsApp(`Olá! Quero mais info sobre: ${tag}`);
    });
  });

  /* ===== FORMS: basic validation & fake submit ===== */
  function basicValidateForm(form){
    let ok = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(inp=>{
      inp.classList.remove('invalid');
      if (!inp.value || inp.value.trim()===''){
        ok = false;
        inp.classList.add('invalid');
      }
    });
    return ok;
  }

  function showInlineMessage(el, msg, type='success'){
    const msgEl = document.createElement('div');
    msgEl.className = 'form-msg';
    msgEl.style.marginTop = '.6rem';
    msgEl.textContent = msg;
    msgEl.style.color = (type === 'error') ? '#B91C1C' : '#064E3B';
    el.appendChild(msgEl);
    setTimeout(()=> msgEl.remove(), 5000);
  }

  const waitlistForm = document.getElementById('form-waitlist');
  if (waitlistForm){
    waitlistForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const ok = basicValidateForm(waitlistForm);
      if (!ok){
        showInlineMessage(waitlistForm, 'Por favor, preenche os campos obrigatórios.', 'error');
        return;
      }
      // fake submit
      showInlineMessage(waitlistForm, 'Inscrição recebida — verifica o WhatsApp em breve!', 'success');
      // show modal confirmation
      if (tplWaitlist){
        const clone = tplWaitlist.content.cloneNode(true);
        const wrapper = document.createElement('div');
        wrapper.className = 'modal show';
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        wrapper.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', ()=> wrapper.remove()));
        wrapper.addEventListener('click', e => { if (e.target === wrapper) wrapper.remove()});
        // reset
        waitlistForm.reset();
      }
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      const ok = basicValidateForm(contactForm);
      if (!ok) { showInlineMessage(contactForm, 'Preenche os campos obrigatórios.', 'error'); return; }
      showInlineMessage(contactForm, 'Mensagem enviada — responderemos por WhatsApp / e-mail.', 'success');
      contactForm.reset();
    });
  }

  /* ===== Keyboard accessibility: close modals with ESC ===== */
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => m.remove());
      document.body.style.overflow = '';
    }
  });

  /* ===== Small optimization: prefill whatsapp buy links on .btn-primary[data-buy] hover ===== */
  document.querySelectorAll('button[data-buy]').forEach(btn=>{
    btn.addEventListener('mouseenter', () => {
      btn.title = 'Clicar para comprar via WhatsApp / M-Pesa';
    });
  });

  /* ===== END ===== */
});
