
function initStoreboxAEO() {
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => gsap.utils.toArray(s);


/* ---------- FAQ accordion ---------- */
$$('.qa').forEach(qa => {
  qa.querySelector('.qa-q').addEventListener('click', () => {
    const a = qa.querySelector('.qa-a'), open = qa.classList.contains('open');
    $$('.qa.open').forEach(o => { o.classList.remove('open'); o.querySelector('.qa-a').style.maxHeight = 0; });
    if (!open) { qa.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

if (!RM) {
  gsap.set('.rv', {opacity:0, y:30});
  ScrollTrigger.batch('.rv', {start:'top 88%',
    onEnter: b => gsap.to(b, {opacity:1, y:0, duration:.8, ease:'power3.out', stagger:.1, overwrite:true})});

  /* ---------- HERO: one query, every engine answers ---------- */
  (function hero(){
    gsap.set(['#engG','#engA','#engC'], {opacity:0, y:26});
    gsap.from(['.shero .eyebrow','.shero h1','.shero .sub','.badges','.os-pill'],
      {opacity:0, y:24, duration:.8, ease:'power3.out', stagger:.1, delay:.15});

    // The query + AI-answer demo text is already baked into #osQ/#aioTxt/
    // #gptTxt (static, crawlable). Capture each, clear it, then type it
    // back in — same visual effect, no locale detection needed.
    const qEl = $('#osQ'), q = qEl.textContent;
    qEl.textContent = '';
    const o = {n:0};
    gsap.to(o, {n:q.length, duration:1, ease:'none', delay:.2,
      onUpdate: () => qEl.textContent = q.slice(0, Math.round(o.n))});
    const tl = gsap.timeline({delay:1.4});
    tl.to(['#engG','#engA','#engC'], {opacity:1, y:0, duration:.55, ease:'power3.out', stagger:.18})
      .add(() => {   // google climb
        const rows = $$('#serpList .srow'), you = rows[0], others = rows.slice(1);
        const h = you.offsetHeight + 7;
        gsap.set(you, {y: 2*h}); gsap.set(others, {y: -h});
        gsap.to(you, {y:0, duration:.6, ease:'power3.inOut'});
        gsap.to(others, {y:0, duration:.6, ease:'power3.inOut',
          onComplete: () => { you.querySelector('.rk').textContent = '1';
            others[0].querySelector('.rk').textContent = '2';
            others[1].querySelector('.rk').textContent = '3';
            gsap.to('#rank1', {scale:1, duration:.45, ease:'back.out(2.6)'}); }});
      }, '+=.1')
      .add(() => {   // AI overview types
        const aioEl = $('#aioTxt'), t = aioEl.textContent;
        aioEl.textContent = '';
        const o2 = {n:0};
        gsap.to(o2, {n:t.length, duration:t.length*.02, ease:'none',
          onUpdate: () => aioEl.textContent = t.slice(0, Math.round(o2.n)),
          onComplete: () => gsap.to('#aioCite', {opacity:1, duration:.4})});
      }, '+=.3')
      .add(() => {   // chatgpt types
        const gptEl = $('#gptTxt'), t = gptEl.textContent;
        gptEl.textContent = '';
        const o3 = {n:0};
        gsap.to(o3, {n:t.length, duration:t.length*.02, ease:'none',
          onUpdate: () => gptEl.textContent = t.slice(0, Math.round(o3.n)),
          onComplete: () => gsap.to('#gptCite', {opacity:1, duration:.4})});
      }, '+=.5');
  })();

  /* ---------- receipts: annotation circles draw ---------- */
  $$('.exhibit').forEach(ex => {
    const ell = ex.querySelector('.anno ellipse'), note = ex.querySelector('.anno-note');
    gsap.set(ell, {strokeDasharray:100, strokeDashoffset:100});
    gsap.set(note, {opacity:0, scale:.7});
    ScrollTrigger.create({trigger:ex, start:'top 72%', once:true, onEnter: () => {
      gsap.to(ell, {strokeDashoffset:0, duration:.9, ease:'power2.inOut', delay:.3});
      gsap.to(note, {opacity:1, scale:1, duration:.4, ease:'back.out(2)', delay:1});
    }});
  });

  /* ---------- spam stamps ---------- */
  $$('.spam').forEach((s, i) => {
    ScrollTrigger.create({trigger:s, start:'top 78%', once:true, onEnter: () =>
      gsap.to(s.querySelector('.stamp'), {scale:1, duration:.35, ease:'back.out(3)', delay:.4 + i*.25})});
  });

  /* ---------- content mill: docs rain and sink ---------- */
  (function mill(){
    const stage = $('#millStage');
    const spawn = () => {
      if (!stage.isConnected) return;
      const d = document.createElement('div'); d.className = 'mill-doc';
      d.style.left = (8 + Math.random()*80) + '%';
      stage.appendChild(d);
      gsap.to(d, {y: stage.offsetHeight + 60, rotation: Math.random()*50 - 25,
        opacity:.15, duration: 2.6 + Math.random()*1.4, ease:'power1.in',
        onComplete: () => d.remove()});
    };
    ScrollTrigger.create({trigger:stage, start:'top 85%', once:true, onEnter: () => {
      spawn(); window.__millIv = setInterval(spawn, 450);
      setTimeout(() => clearInterval(window.__millIv), 30000);   // stop after 30s
    }});
  })();

  /* ---------- pipeline ticks ---------- */
  ScrollTrigger.create({trigger:'.hu-card.ours', start:'top 75%', once:true, onEnter: () =>
    gsap.to('.pipe-step .ok', {opacity:1, duration:.3, stagger:.5, delay:.5, ease:'power2.out'})});

  /* ---------- dashboard counters ---------- */
  ScrollTrigger.create({trigger:'#dash', start:'top 75%', once:true, onEnter: () => {
    const g = {v:14};
    gsap.to(g, {v:2, duration:2, ease:'power2.out', delay:.3,
      onUpdate: () => $('#rG').textContent = Math.round(g.v)});
    [['#rC','Recommended ✓'],['#rA','Cited ✓'],['#rP','Cited ✓']].forEach(([id, txt], i) =>
      gsap.delayedCall(1 + i*.5, () => { const el = $(id); el.textContent = txt;
        el.style.fontSize = '13px';
        gsap.fromTo(el, {opacity:.2, scale:.8}, {opacity:1, scale:1, duration:.4, ease:'back.out(2)'}); }));
    const L = {v:0}, D = {v:0};
    gsap.to(L, {v:14, duration:1.8, delay:.5, ease:'power2.out', onUpdate: () => $('#dLinks').textContent = Math.round(L.v)});
    gsap.to(D, {v:37, duration:2, delay:.7, ease:'power2.out', onUpdate: () => $('#dLeads').textContent = Math.round(D.v)});
  }});

  window.addEventListener('load', () => gsap.delayedCall(.4, () => ScrollTrigger.refresh()));
} else {
  document.querySelectorAll('.rv').forEach(el => el.style.opacity = 1);
  // #osQ/#aioTxt/#gptTxt already carry their real, correct text statically.
  document.querySelectorAll('.cite-chip').forEach(el => el.style.opacity = 1);
  document.querySelectorAll('.stamp').forEach(el => el.style.transform = 'rotate(9deg) scale(1)');
  document.querySelectorAll('.pipe-step .ok').forEach(el => el.style.opacity = 1);
  $('#rG').textContent = '2'; $('#dLinks').textContent = '14'; $('#dLeads').textContent = '37';
  ['#rC','#rA','#rP'].forEach(id => { const el = $(id); el.textContent = 'Cited ✓'; el.style.fontSize = '13px'; el.style.opacity = 1; });
}
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStoreboxAEO);
} else {
  initStoreboxAEO();
}
