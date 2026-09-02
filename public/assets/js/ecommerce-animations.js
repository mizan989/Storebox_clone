
function initStoreboxEcommerce() {
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => gsap.utils.toArray(s);

/* ---------- persona switcher ---------- */
const WHO = [
  {tag:"For you, we're the add-on", title:"Keep Etsy. Stop depending on it.", items:[
    "Etsy is great for discovery. Your own store is where repeat customers buy — <b>commission-free</b>.",
    "We build it from your Etsy shop in 24 hours — same products, your prices, your rules.",
    "One policy change, one suspension, one fee hike shouldn't be able to end your business."]},
  {tag:"For you, we're the upgrade", title:"Your bio deserves a real store.",  items:[
    "A 2-tap checkout beats “DM to order” — every time, on every post.",
    "Your own store can't be shadow-banned. Algorithms change; your checkout doesn't.",
    "Every follower becomes a customer <b>you own</b> — email, orders, repeat sales."]},
  {tag:"For you, we're the replacement", title:"Same store. None of the labor.", items:[
    "Free migration — products, variants, customers, reviews. You don't lift a finger.",
    "Your app-stack bill goes to <b>$0</b>. Reviews, bookings, bundles, email — all built in.",
    "We run it after launch: new products, sales, fixes — just text us."]},
  {tag:"For you, we're the shortcut", title:"The easiest first store on Earth.", items:[
    "Send photos and prices — a WhatsApp voice note genuinely works.",
    "Your store draft is free, in 24 hours. No card, no commitment.",
    "{{PRICE_STORE}} all-in when you love it — hosting, payments, shipping, everything."]}
];
const PRICE_STORE_TXT = document.querySelector('[data-sb-var="price_store_headline"]').textContent;
$$('#whoTabs .who-tab').forEach(t => t.addEventListener('click', () => {
  $$('#whoTabs .who-tab').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  const w = WHO[+t.dataset.who];
  const paint = () => {
    $('#whoTag').textContent = w.tag;
    $('#whoTitle').textContent = w.title;
    $('#whoList').innerHTML = w.items.map(i =>
      `<li><span class="tick">✓</span><span>${i.replace('{{PRICE_STORE}}', PRICE_STORE_TXT)}</span></li>`).join('');
  };
  if (RM) { paint(); return; }
  gsap.to('#whoCard', {opacity:0, y:10, duration:.18, onComplete: () => {
    paint(); gsap.to('#whoCard', {opacity:1, y:0, duration:.3, ease:'power2.out'});
  }});
}));

/* ---------- FAQ ---------- */
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

  /* ---------- HERO: catalog builds itself ---------- */
  (function hero(){
    gsap.from(['.ehero .eyebrow','.ehero h1','.ehero .sub','.sec-actions'],
      {opacity:0, y:24, duration:.8, ease:'power3.out', stagger:.1, delay:.15});
    const chips = $$('.in-chip');
    const cards = $$('#prodGrid .pcard');
    gsap.set(chips, {opacity:0, y:-20, scale:.7});
    gsap.set(cards, {opacity:0, y:30, scale:.85});
    gsap.set('#prodGrid .v', {opacity:0, scale:.4});
    gsap.set('#prodGrid .stock', {opacity:0});
    // whole build-a-store loop: chips appear, hold so they're readable,
    // dive into the storefront, hold the finished store, then repeat
    const tl = gsap.timeline({delay:2.2, repeat:-1, repeatDelay:2.8});
    tl.to(chips, {opacity:1, y:0, scale:1, duration:.5, ease:'back.out(2)', stagger:.15})
      .to({}, {duration:1.6})
      .to(chips, {y:60, opacity:0, scale:.6, duration:.55, ease:'power2.in', stagger:.1})
      .to(cards, {opacity:1, y:0, scale:1, duration:.5, ease:'back.out(1.8)', stagger:.14}, '-=.2')
      .to('#prodGrid .v', {opacity:1, scale:1, duration:.3, ease:'back.out(2.4)', stagger:.05}, '-=.2')
      .to('#prodGrid .stock', {opacity:1, duration:.3, stagger:.08}, '-=.3')
      .to({}, {duration:3});
  })();

  /* ---------- receipt prints ---------- */
  ScrollTrigger.create({trigger:'#receipt', start:'top 72%', once:true, onEnter: () => {
    const lines = $$('#receipt .r-line');
    gsap.to(lines, {opacity:1, duration:.25, stagger:.28, ease:'none'});
    const t = {v:0};
    gsap.to(t, {v:248, duration: lines.length*.28 + .4, ease:'power1.inOut',
      onUpdate: () => $('#rTotal').textContent = Math.round(t.v)});
    gsap.to('#stamp2', {scale:1, duration:.45, ease:'back.out(2.4)', delay: lines.length*.28 + .7,
      onStart: () => gsap.set('#stamp2', {rotate:-8})});
  }});

  /* ---------- plugin hell fills ---------- */
  ScrollTrigger.create({trigger:'#hellStage', start:'top 80%', once:true, onEnter: () => {
    const stage = $('#hellStage');
    const plugs = [
      ['Reviews','$15/mo'],['Bookings','$29/mo'],['Bundles','$20/mo'],['SEO','$30/mo'],
      ['Email','$45/mo'],['Marketplace sync','$39/mo'],['Subscriptions','$29/mo'],
      ['⚠ conflicts with theme',''],['Wishlist','$9/mo'],['⚠ update broke checkout',''],
      ['Currency','$12/mo'],['Upsell','$19/mo']];
    plugs.forEach(([name, price], i) => {
      const p = document.createElement('div'); p.className = 'plug';
      p.innerHTML = name.startsWith('⚠') ? `<span class="warn">${name}</span>` : `${name} <span class="warn">${price}</span>`;
      p.style.left = (4 + (i*29) % 62) + '%';
      p.style.top = (6 + (i*23) % 70) + '%';
      p.style.transform = `rotate(${(i%2 ? 1 : -1) * (2 + i % 5)}deg)`;
      stage.appendChild(p);
      gsap.fromTo(p, {opacity:0, y:-26, scale:.6}, {opacity:1, y:0, scale:1,
        duration:.32, ease:'back.out(1.6)', delay:.3 + i*.22});
    });
  }});

  /* ---------- rented land ---------- */
  ScrollTrigger.create({trigger:'#skimLand', start:'top 75%', once:true, onEnter: () => {
    gsap.to('#skimCut', {width:'24%', duration:1, ease:'power2.inOut', delay:.4});
    gsap.to('#skimLand .skim-row', {opacity:1, duration:.35, stagger:.3, delay:.5});
  }});
  ScrollTrigger.create({trigger:'#muteLand', start:'top 75%', once:true, onEnter: () => {
    gsap.to('#restricted', {opacity:1, duration:.5, delay:1});
    gsap.to('#muteCard', {opacity:.55, duration:.5, delay:1});
    gsap.delayedCall(1.1, () => $('#muteOrders').textContent = '▂▄▆▇ ▁▁▁▁ — gone');
  }});

  /* ---------- sell anything micro-demos ---------- */
  ScrollTrigger.create({trigger:'#mProd', start:'top 80%', once:true, onEnter: () =>
    gsap.to('#mProdToast', {y:0, opacity:1, duration:.5, ease:'power3.out', delay:.8})});
  ScrollTrigger.create({trigger:'#mServ', start:'top 80%', once:true, onEnter: () => {
    gsap.delayedCall(.7, () => $('#bookSlot').classList.add('booked'));
    gsap.to('#bkTick', {opacity:1, duration:.4, delay:.8, ease:'power2.out'});
  }});
  ScrollTrigger.create({trigger:'#mDig', start:'top 80%', once:true, onEnter: () => {
    gsap.to('#dlBar', {width:'100%', duration:1.1, ease:'power2.inOut', delay:.5});
    gsap.to('#dlDone', {opacity:1, duration:.4, delay:1.7});
  }});
  ScrollTrigger.create({trigger:'#mShip', start:'top 80%', once:true, onEnter: () => {
    const flow = $('#mShip .ship-flow'), dot = $('#shipDot');
    const w = flow.offsetWidth;
    gsap.set(dot, {opacity:1});
    gsap.fromTo(dot, {x:0}, {x: w*.72, duration:2.2, ease:'power1.inOut', repeat:-1, repeatDelay:.8, delay:.5});
  }});

  /* ---------- text us demo ---------- */
  ScrollTrigger.create({trigger:'#txtDemo', start:'top 70%', once:true, onEnter: () => {
    const tl = gsap.timeline({delay:.3});
    tl.to('#msg1', {opacity:1, y:0, duration:.45, ease:'power2.out'})
      .to('#typing', {opacity:1, duration:.25}, '+=.4')
      .to('#typing', {opacity:0, duration:.2}, '+=1.1')
      .to('#msg2', {opacity:1, duration:.45, ease:'power2.out'})
      .to('#saleBanner', {height:34, paddingTop:9, paddingBottom:9, duration:.5, ease:'power3.out'}, '-=.1')
      .to('.ls-card.newp', {opacity:1, scale:1, duration:.45, ease:'back.out(1.8)', stagger:.15}, '-=.1')
      .to('.ls-price .old', {opacity:1, duration:.3}, '-=.2')
      .to('.ls-price .new', {opacity:1, duration:.3}, '-=.1');
  }});

  /* ---------- compare table rows ---------- */
  ScrollTrigger.create({trigger:'.tbl-wrap', start:'top 80%', once:true, onEnter: () =>
    gsap.from('tbody tr', {opacity:0, x:-24, duration:.5, ease:'power2.out', stagger:.08})});

  window.addEventListener('load', () => gsap.delayedCall(.4, () => ScrollTrigger.refresh()));
} else {
  document.querySelectorAll('.rv').forEach(el => el.style.opacity = 1);
  document.querySelectorAll('#receipt .r-line').forEach(el => el.style.opacity = 1);
  $('#rTotal').textContent = '248';
  $('#stamp2').style.transform = 'translate(-50%,-50%) rotate(-8deg) scale(1)';
  document.querySelectorAll('.skim-row').forEach(el => el.style.opacity = 1);
  $('#skimCut').style.width = '24%';
  $('#restricted').style.opacity = 1;
  ['#msg1','#msg2'].forEach(s => $(s).style.opacity = 1);
  $('#saleBanner').style.height = 'auto'; $('#saleBanner').style.padding = '9px 0';
  document.querySelectorAll('.ls-card.newp').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  document.querySelectorAll('.ls-price .old,.ls-price .new').forEach(el => el.style.opacity = 1);
  $('#bkTick').style.opacity = 1; $('#bookSlot').classList.add('booked');
  $('#dlBar').style.width = '100%'; $('#dlDone').style.opacity = 1;
  $('#mProdToast').style.opacity = 1; $('#mProdToast').style.transform = 'none';
}
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStoreboxEcommerce);
} else {
  initStoreboxEcommerce();
}
