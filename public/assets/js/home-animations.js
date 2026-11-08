
function initStoreboxHome() {
if (!window.__sbHomeHeroScriptRan) { window.__sbHomeHeroScriptRan = true;
gsap.registerPlugin(ScrollTrigger);
/* GSAP's default force3D:"auto" decides per-tween whether to promote an
   element to its own GPU layer, and can toggle that promotion on/off across
   frames — each toggle forces a repaint, which is the flicker mobile Safari
   shows on scroll-scrubbed transforms. Forcing it permanently on keeps every
   animated element on one stable compositor layer. */
gsap.config({force3D:true});
/* Flip visibility back on in the same synchronous tick as the gsap.from()
   calls below set up their animated (opacity/transform) start states —
   visibility doesn't touch the properties those .from() calls animate, so
   it doesn't corrupt their "capture current value as the target" logic the
   way pre-setting opacity/transform in CSS did. Net effect: the browser
   never paints a frame of the fully-visible resting layout before the
   animation takes over. */
gsap.set(['#phoneWrap','.hline > span','#fb1 .eyebrow','#fb1 .hero-proofline'], {visibility:'visible'});
/* lagSmoothing(0) was disabling GSAP's frame-drop protection — under the
   per-frame layout cost of the browser<->phone morph that let scrubbing
   stutter. Restoring the default keeps the timeline smooth when a frame
   runs long instead of lurching. */
gsap.ticker.lagSmoothing(500, 33);
ScrollTrigger.config({ignoreMobileResize:true});
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* The pinned hero "film" only performs well on a fine-pointer/wide desktop
   viewport — on phones (touch scroll, weaker GPU, throttled scroll events)
   the pin can't track cleanly (see the flicker/jump back-and-forth). Rather
   than keep fighting the pin on mobile, give it the same static, directly-
   scrollable `.flat` layout already built for reduced-motion users — desktop
   keeps the full animated version untouched. */
const IS_MOBILE = window.matchMedia('(max-width:920px)').matches;
const $  = s => document.querySelector(s);
const $$ = s => gsap.utils.toArray(s);
/* normalizeScroll() hijacks native wheel/touch scrolling and re-drives it
   from JS — on trackpads and phones that reads as heavy input lag, which was
   the main "laggy, can't tell what's happening" symptom. ignoreMobileResize
   above already handles the address-bar pin flicker it was added for, so we
   let the browser scroll natively. */
/* Make the per-character "$10" gradient read as one continuous sweep instead
   of each glyph independently replaying the full color range (see CSS
   comment on .big-price .pchar for why that looked like a seam/crop). Sizes
   each char's background to the full "$10" group width and offsets its
   position so they line up into a single gradient. Re-run on resize since
   the clamp() font-size (and therefore each char's pixel width) is
   viewport-dependent. */
function alignPriceGradient(){
  const chars = [...document.querySelectorAll('.big-price .pchar:not(.mo)')];
  if (!chars.length) return;
  const lefts = chars.map(c => c.getBoundingClientRect().left);
  const groupLeft = Math.min(...lefts);
  const groupRight = Math.max(...chars.map(c => c.getBoundingClientRect().right));
  const groupWidth = groupRight - groupLeft;
  chars.forEach(c => {
    const left = c.getBoundingClientRect().left;
    c.style.backgroundSize = groupWidth + 'px 100%';
    c.style.backgroundPosition = -(left - groupLeft) + 'px 0';
  });
}
alignPriceGradient();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignPriceGradient);
window.addEventListener('resize', () => { clearTimeout(window.__pgT); window.__pgT = setTimeout(alignPriceGradient, 150); });

/* Whole-page scroll progress, fixed to the top of the viewport — a plain
   fill percentage isn't motion-sickness-triggering the way the hero's
   scroll-jacked story is, so this runs for every visitor including
   reduced-motion, unlike the animations gated behind `if (!RM)` below. */
const pageProgressFill = $('#pageProgressFill');
if (pageProgressFill) {
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => gsap.set(pageProgressFill, {scaleX: self.progress})
  });
}

const yearGrid = $('#yearGrid');
for (let i = 0; i < 66; i++) { const d = document.createElement('span'); d.className = 'ydot'; yearGrid.appendChild(d); }
(function marquee(){
  const track = $('#mqTrack');
  track.innerHTML += track.innerHTML;
  if (RM) return;
  gsap.to(track, {xPercent:-50, ease:'none', duration:30, repeat:-1});
})();
if (!RM) {
/* Lenis smooth scroll: interpolates wheel input so the page glides instead
   of stepping — the stepped native wheel is what read as "flicker" against
   the scrubbed hero. Touch stays native (Lenis default). Guarded so a CDN
   failure just falls back to native scrolling. */
if (window.Lenis) {
  const lenis = new Lenis({duration:1.05, smoothWheel:true});
  window.lenis = lenis;
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
}
gsap.set('.rv', {opacity:0, y:26});
ScrollTrigger.batch('.rv', {
  start:'top 86%',
  onEnter: b => gsap.to(b, {opacity:1, y:0, duration:.8, ease:'power3.out', stagger:.1, overwrite:true})
});
/* Scroll restoration / anchor jumps can land PAST a trigger's zone without
   ever crossing it — its onEnter never fires and that content stays
   invisible forever. After every refresh, reveal any missed .rv and fire
   (then retire) any missed once-triggers. Idempotent: opacity/isTweening
   guards the reveals, killed triggers drop out of getAll(). */
const fireMissed = () => {
  const limit = window.innerHeight * .9;
  $$('.rv').forEach(el => {
    if (el.getBoundingClientRect().top < limit && getComputedStyle(el).opacity === '0' && !gsap.isTweening(el))
      gsap.to(el, {opacity:1, y:0, duration:.6, ease:'power3.out', overwrite:true});
  });
  ScrollTrigger.getAll().forEach(st => {
    if (st.vars.once && st.vars.onEnter && st.progress === 1) { const f = st.vars.onEnter; st.kill(); f(st); }
  });
};
ScrollTrigger.addEventListener('refresh', () => setTimeout(fireMissed, 60));
(function steps5(){
  const fill = $('#s5fill'), steps = $$('.s5');
  ScrollTrigger.create({
    trigger:'#steps5', start:'top 72%', end:'bottom 55%', scrub:.4,
    onUpdate: self => {
      const p = self.progress;
      const vert = window.innerWidth < 900;
      gsap.set(fill, vert ? {scaleY:p, scaleX:1} : {scaleX:p, scaleY:1});
      steps.forEach((s, i) => s.classList.toggle('on', p >= (i + .35) / steps.length));
    }
  });
})();
(function rip(){
  const tl = gsap.timeline({scrollTrigger:{
    trigger:'#ripStage', start:'top 78%', end:'top 22%', scrub:1}});
  tl.to('.inv-top', {x:'-=30', y:'-=38', rotate:-7, ease:'power1.in'}, 0)
    .to('.inv-bot', {x:'+=22', y:'+=112', rotate:8, ease:'power1.in'}, 0)
    .to('.invoice', {opacity:.16}, .55)
    .fromTo('.price-reveal', {scale:.75, opacity:0, y:20}, {scale:1, opacity:1, y:0, ease:'back.out(1.6)'}, .3)
    .to('.shred', {
      y: i => 130 + i*38, x: i => (i%2 ? 40+i*14 : -30-i*16),
      rotation: i => (i%2 ? 70 : -60), opacity:0, stagger:.02, ease:'power1.in'}, .05);
  const hrs = {v:0};
  ScrollTrigger.create({trigger:'#diyCard', start:'top 75%', once:true, onEnter: () => {
    gsap.to(hrs, {v:43, duration:1.8, ease:'power2.out',
      onUpdate: () => $('#diyHours').textContent = Math.round(hrs.v)});
    gsap.to('.dx', {opacity:1, scale:1, rotate:-8, duration:.32, ease:'back.out(2.2)', stagger:.28, delay:.3});
  }});
})();
(function sellFlow(){
  const stage = $('#sfBody'), cursor = $('#custCursor'), dot = $('#flyDot');
  if (!stage) return;
  const pos = el => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {x: r.left - s.left + r.width/2, y: r.top - s.top + r.height/2}; };
  const fpos = sel => ({x: () => pos($(sel)).x, y: () => pos($(sel)).y});
  const confetti = () => {
    const c = pos($('.sf-check'));
    const colors = ['#FF6B2C','#FFA149','#E9384D','#0FA88F','#FFC53D'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i'); p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      stage.appendChild(p);
      gsap.set(p, {x: c.x, y: c.y, opacity: 1, scale: .6 + Math.random()*.7});
      gsap.to(p, {x: c.x + (Math.random()*180 - 90), y: c.y - 30 - Math.random()*90,
        rotation: Math.random()*300 - 150, duration: .5, ease: 'power2.out'});
      gsap.to(p, {y: '+=130', opacity: 0, duration: .7, delay: .45, ease: 'power1.in',
        onComplete: () => p.remove()});
    }
  };
  const play = () => {
    gsap.set(['#sfPay','#sfDone'], {opacity:0, x:40});
    gsap.set('#sfCatalog', {opacity:1, x:0});
    gsap.set('#sfBadge', {scale:0});
    gsap.set(cursor, {x: stage.offsetWidth - 70, y: stage.offsetHeight - 40, opacity:0});
    const tl = gsap.timeline({onComplete: () => gsap.delayedCall(2.4, play)});
    tl.to(cursor, {opacity:1, duration:.25})
      .to(cursor, {...fpos('#sfAdd'), duration:.9, ease:'power2.inOut'})
      .to('#sfAdd', {scale:.92, duration:.1, yoyo:true, repeat:1})
      .add(() => { gsap.set(dot, {...pos($('#sfAdd')), opacity:1});
        gsap.to(dot, {...pos($('#sfCart')), duration:.55, ease:'power2.inOut',
          onComplete: () => { gsap.set(dot, {opacity:0});
            gsap.to('#sfBadge', {scale:1, duration:.35, ease:'back.out(3)'}); }}); })
      .to({}, {duration:.75})
      .to(cursor, {...fpos('#sfCheckout'), duration:.7, ease:'power2.inOut'})
      .to('#sfCheckout', {scale:.96, duration:.1, yoyo:true, repeat:1})
      .to('#sfCatalog', {opacity:0, x:-40, duration:.4, ease:'power2.in'})
      .to('#sfPay', {opacity:1, x:0, duration:.5, ease:'power3.out'}, '-=.05')
      .to(cursor, {...fpos('#sfPayBtn'), duration:.8, ease:'power2.inOut'})
      .to('#sfPayBtn', {scale:.96, duration:.1, yoyo:true, repeat:1})
      .to('#sfPay', {opacity:0, x:-40, duration:.35, ease:'power2.in'}, '+=.15')
      .fromTo('#sfDone', {opacity:0, x:0, scale:.9}, {opacity:1, scale:1, duration:.5, ease:'back.out(1.7)'})
      .add(confetti, '-=.1')
      .to(cursor, {opacity:0, x:'+=60', duration:.4}, '<')
      .to({}, {duration:1.6});
  };
  ScrollTrigger.create({trigger:'#shopStage', start:'top 70%', once:true, onEnter: () => setTimeout(play, 400)});
})();
gsap.set(['#osG','#osC'], {opacity:0, y:26});
ScrollTrigger.create({trigger:'#oneSearch', start:'top 72%', once:true, onEnter: () => {
  const qEl = $('#osQ'), q = qEl.textContent;
  qEl.textContent = '';
  const o = {n:0};
  gsap.to(o, {n:q.length, duration:1, ease:'none', delay:.2,
    onUpdate: () => qEl.textContent = q.slice(0, Math.round(o.n))});
  const tl = gsap.timeline({delay:1.4});
  tl.to(['#osG','#osC'], {opacity:1, y:0, duration:.55, ease:'power3.out', stagger:.15})
    .add(() => {
      const rows = $$('#serpList .srow');
      const you = rows[0], others = rows.slice(1);
      const h = you.offsetHeight + 8;
      gsap.set(you, {y: 2*h});
      gsap.set(others, {y: -h});
      const t2 = gsap.timeline();
      t2.to(you, {y:0, duration:.6, ease:'power3.inOut'})
        .to(others, {y:0, duration:.6, ease:'power3.inOut'}, '<')
        .add(() => { you.querySelector('.rk').textContent = '1';
          others[0].querySelector('.rk').textContent = '2';
          others[1].querySelector('.rk').textContent = '3'; }, '<+0.3')
        .to('#rank1', {scale:1, duration:.45, ease:'back.out(2.6)'});
    }, '+=.15')
    .add(() => {
      const aiEl = $('#aiTxt1'), txt = aiEl.textContent;
      aiEl.textContent = '';
      const o2 = {n:0};
      gsap.to(o2, {n:txt.length, duration:txt.length*0.022, ease:'none',
        onUpdate: () => aiEl.textContent = txt.slice(0, Math.round(o2.n))});
    }, '+=.3');
}});
ScrollTrigger.create({trigger:'#graphCard', start:'top 75%', once:true, onEnter: () => {
  const line = $('#leadLine'), L = line.getTotalLength();
  gsap.set(line, {strokeDasharray:L, strokeDashoffset:L});
  const tl = gsap.timeline({delay:.2});
  tl.to(line, {strokeDashoffset:0, duration:2, ease:'power1.inOut'})
    .to('#leadArea', {opacity:1, duration:.8}, '-=1.2')
    .to('#ping1', {opacity:1, scale:1, duration:.4, ease:'back.out(2.4)'}, .7)
    .to('#ping2', {opacity:1, scale:1, duration:.4, ease:'back.out(2.4)'}, 1.5);
}});
ScrollTrigger.create({trigger:'#officeBx .office-tiles', start:'top 78%', once:true, onEnter: () => {
  gsap.fromTo('#officeBx .otile', {y:44, scale:.7, opacity:0},
    {y:0, scale:1, opacity:1, duration:.55, ease:'back.out(1.9)', stagger:.07, delay:.1});
}});
(function bring(){
  const box = $('#bringBox');
  const center = el => { const r = el.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; };
  const tl = gsap.timeline({scrollTrigger:{
    trigger:'#bring',
    start:'top top',
    end:'+=130%',
    pin:true,
    scrub:true,
    invalidateOnRefresh:true
  }});
  tl.to({}, {duration:.7});
  $$('.src-chip').forEach((chip, i) => {
    tl.to(chip, {
      x: () => center(box).x - center(chip).x + Number(gsap.getProperty(chip,'x')),
      y: () => center(box).y - center(chip).y + Number(gsap.getProperty(chip,'y')),
      scale:.25, opacity:0, ease:'power2.in', duration:.6}, i*.18);
  });
  tl.fromTo(box, {scale:1}, {scale:1.08, duration:.12, yoyo:true, repeat:1, ease:'power2.out'}, '>-0.1')
    .fromTo('#siteOut', {y:70, opacity:0, scale:.9}, {y:0, opacity:1, scale:1, duration:.5, ease:'back.out(1.5)'}, '>');
})();
ScrollTrigger.create({trigger:'#pricingGrid', start:'top 78%', once:true, onEnter: () => {
  gsap.fromTo('#pricingGrid .pcard',
    {y:70, opacity:0, rotation: i => (i%2 ? 4 : -4)},
    {y:0, opacity:1, rotation:0, duration:.8, ease:'back.out(1.4)', stagger:.12});
}});
gsap.set('#pricingGrid .pcard', {opacity:0});
ScrollTrigger.create({trigger:'#mathCard', start:'top 72%', once:true, onEnter: () => {
  const yearCountEl = $('#yearCount');
  const years = parseInt(yearCountEl.textContent, 10) || 66;
  yearCountEl.textContent = '0';
  const cnt = {v:0};
  gsap.to(cnt, {v:years, duration:1.8, ease:'power1.inOut', delay:.2,
    onUpdate: () => yearCountEl.textContent = Math.round(cnt.v)});
  gsap.to($$('#yearGrid .ydot').slice(0, years), {
    backgroundColor:'#FF6B2C', borderColor:'rgba(255,107,44,.7)',
    duration:.25, stagger:{each:.026}, delay:.2, ease:'none'});
}});
const heal = () => window.__filmFix ? window.__filmFix() : ScrollTrigger.refresh();
window.addEventListener('load', () => gsap.delayedCall(.4, heal));
let __lastResizeW = window.innerWidth || document.documentElement.clientWidth;
window.addEventListener('resize', () => {
  const w = window.innerWidth || document.documentElement.clientWidth;
  if (Math.abs(w - __lastResizeW) < 10) return;
  __lastResizeW = w;
  clearTimeout(window.__rzT);
  window.__rzT = setTimeout(heal, 200);
});
(function watchViewport(){
  const w = () => window.innerWidth || document.documentElement.clientWidth;
  let lastW = w(), t0 = performance.now();
  const iv = setInterval(() => {
    if (Math.abs(w() - lastW) > 60) { lastW = w(); heal(); }
    if (performance.now() - t0 > 6000) clearInterval(iv);
  }, 200);
})();
if (window.matchMedia('(pointer:fine)').matches) {
  $$('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      gsap.to(b, {x:(e.clientX-r.left-r.width/2)*.25, y:(e.clientY-r.top-r.height/2)*.35,
        duration:.3, ease:'power2.out'});
    });
    b.addEventListener('mouseleave', () => gsap.to(b, {x:0, y:0, duration:.6, ease:'elastic.out(1,.4)'}));
  });
}
(function heroFilm(){
  // Cursor idle-loop (visits the mock button/image/cards) is decorative,
  // cheap (just x/y translate on one small badge) and scroll-independent —
  // runs the same on mobile and desktop, so it's set up before the mobile
  // branch below rather than being skipped along with the pinned timeline.
  const body = $('#mbody'), cursor = $('#heroCursor');
  const at = el => ({x: el.offsetLeft + el.offsetWidth/2, y: el.offsetTop + el.offsetHeight/2});
  gsap.set(cursor, {opacity:1, x:44, y:64});
  const startIdle = () => {
    const spots = ['.m-btn','.m-img','.m-card','.m-logo'].map(s => body.querySelector(s));
    const idle = gsap.timeline({repeat:-1, repeatDelay:.5, delay:1.2, paused:true});
    spots.forEach(el => idle.to(cursor, {...at(el), duration:1.15, ease:'power2.inOut', delay:.4}));
    /* An infinite repeat:-1 timeline left ticking forever (even long after
       the user has scrolled past the mockup) adds a constant per-frame cost
       that competes with whatever scroll/reveal work is happening at that
       moment — that contention is what read as the animation "getting
       stuck" right as that section scrolled by. Only let it run while the
       mockup is actually on screen. */
    ScrollTrigger.create({
      trigger:'#phoneWrap', start:'top bottom', end:'bottom top',
      onToggle: self => self.isActive ? idle.play() : idle.pause()
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(startIdle); else startIdle();

  if (IS_MOBILE) {
    document.getElementById('heroFilm').classList.add('flat');
    // Desktop's per-child detail animations (headline slide-up, sentence
    // word-color reveal, price digit bounce, chip pop-in) live INSIDE the
    // pinned scrub timeline below, which mobile skips entirely — so those
    // need porting here too, just as plain one-shot triggers instead of
    // scroll-scrubbed, or the hero reads as completely inert on mobile.
    const blocks = [$('#fb1'), $('#phoneWrap'), $('#fb3'), $('#fb4')].filter(Boolean);
    gsap.set(blocks, {opacity:0, y:26});
    gsap.set('.hline > span', {yPercent:115});
    gsap.set('.pchar', {opacity:0, y:-50});
    gsap.set('.serious', {opacity:0});
    gsap.set('#fb4 .chip', {opacity:0, y:12, scale:.7});
    gsap.set('.fb4-btn', {opacity:0, y:12});
    ScrollTrigger.batch(blocks, {
      start:'top 86%',
      onEnter: group => group.forEach(el => {
        gsap.to(el, {opacity:1, y:0, duration:.8, ease:'power3.out', overwrite:true});
        if (el.id === 'fb1') {
          gsap.to('.hline > span', {yPercent:0, duration:.7, ease:'power3.out', stagger:.1, delay:.1});
        }
        if (el.id === 'fb3') {
          gsap.to('#buildSent .w', {
            color: (i, t) => t.classList.contains('hl') ? '#F0591E' : '#221D15',
            stagger:.1, duration:.15, ease:'none', delay:.2});
        }
        if (el.id === 'fb4') {
          gsap.timeline({delay:.15})
            .to('.pchar', {opacity:1, y:0, duration:.5, stagger:.1, ease:'bounce.out'})
            .to('.serious', {opacity:1, duration:.2}, '-=.15')
            .to('#fb4 .chip', {opacity:1, y:0, scale:1, duration:.25, stagger:.07, ease:'back.out(2)'}, '-=.05')
            .to('.fb4-btn', {opacity:1, y:0, duration:.25}, '-=.05');
        }
      })
    });
    return;
  }
  const browser = $('#miniBrowser');
  gsap.from('.hline > span', {yPercent:115, duration:.9, ease:'power3.out', stagger:.12, delay:.2});
  gsap.from(['#fb1 .eyebrow','#fb1 .hero-proofline'],
    {opacity:0, y:18, duration:.7, ease:'power3.out', stagger:.15, delay:.7});
  gsap.from('#phoneWrap', {opacity:0, y:40, duration:.9, ease:'power3.out', delay:.5});
  const natH = () => { const prev = browser.style.height; browser.style.height = 'auto';
    const h = browser.offsetHeight; browser.style.height = prev; return h; };
  gsap.set(browser, {height: natH()});
  const VW = () => window.innerWidth || document.documentElement.clientWidth || 1200;
  const VH = () => window.innerHeight || document.documentElement.clientHeight || 800;
  const BW = () => Math.min(520, VW()*.88);
  const PW = () => Math.min(258, VW()*.6), PH = () => Math.min(520, VH()*.62);
  let bw0 = BW(), nh0 = natH(), pw0 = PW(), ph0 = PH();
  const getBW0 = () => bw0, getNH0 = () => nh0, getPW0 = () => pw0, getPH0 = () => ph0;
  const hint = $('#scrollHint');
  const tl = gsap.timeline({defaults:{ease:'power2.inOut'}, scrollTrigger:{
    trigger:'#film', start:'top top', end:'bottom bottom', scrub:true,
    pin:'#filmStage',
    onUpdate: self => {
      // fade the "scroll to watch" cue out once the story has clearly started
      if (hint) hint.classList.toggle('gone', self.progress > 0.04);
    },
    onLeaveBack: () => {
      tl.progress(0);
      gsap.set('#fb1', {clearProps:'opacity,y'});
      gsap.set('.hline > span', {clearProps:'transform'});
      gsap.set('#phoneWrap', {clearProps:'opacity,scale,y,top'});
    }}});
  tl.addLabel('morph')
    .to('#fb1', {opacity:0, y:-36, duration:.3}, 'morph')
    .fromTo('#phoneWrap', {top:'68%'}, {top:'50%', duration:.9, immediateRender:false}, 'morph')
    .fromTo(browser, {width:getBW0, height:getNH0, borderRadius:18},
      {width:getPW0, height:getPH0, borderRadius:38, duration:1, ease:'power3.inOut', immediateRender:false}, 'morph')
    .to('#browserBar', {height:0, opacity:0, paddingTop:0, paddingBottom:0, duration:.5}, 'morph+=.15')
    .to('#notch', {opacity:1, duration:.25}, 'morph+=.6')
    .fromTo('#fb2cap', {opacity:0, y:16}, {opacity:1, y:0, duration:.3}, 'morph+=.35')
    .to({}, {duration:.25})
    .addLabel('sent')
    .to('#fb2cap', {opacity:0, duration:.2}, 'sent')
    .to('#phoneWrap', {opacity:0, scale:.7, y:-60, duration:.5}, 'sent')
    .fromTo('#fb3', {opacity:0}, {opacity:1, duration:.25}, 'sent+=.2')
    .to('#buildSent .w', {
      color: (i, t) => t.classList.contains('hl') ? '#F0591E' : '#221D15',
      stagger:.12, duration:.12, ease:'none'}, 'sent+=.35')
    .to({}, {duration:.25})
    .addLabel('price')
    .to('#fb3', {opacity:0, y:-26, duration:.3}, 'price')
    .fromTo('#fb4', {opacity:0}, {opacity:1, duration:.2}, 'price+=.1')
    .fromTo('.agency-strike', {opacity:0, y:-12}, {opacity:1, y:0, duration:.3}, 'price+=.15')
    .fromTo('.pchar', {opacity:0, y:-170}, {opacity:1, y:0, duration:.55, stagger:.13, ease:'bounce.out'}, 'price+=.35')
    .fromTo('.serious', {opacity:0}, {opacity:1, duration:.2}, 'price+=.75')
    .fromTo('#fb4 .chip', {opacity:0, y:16, scale:.7}, {opacity:1, y:0, scale:1, duration:.25, stagger:.07, ease:'back.out(2)'}, 'price+=.85')
    .fromTo('.fb4-btn', {opacity:0, y:18}, {opacity:1, y:0, duration:.25}, 'price+=1.0')
    .to({}, {duration:.6});
  window.__filmFix = () => {
    /* invalidate() makes every .to()/.fromTo() child re-capture its start
       values from the CURRENT DOM. Mid-scroll that current state is halfway
       through the story (phone faded, fb1 hidden…), so re-capturing from it
       corrupts every beat — e.g. the phone never hides again over the $10
       reveal. Rewind to the rest state first, re-measure, then snap back. */
    const p = tl.progress();
    tl.progress(0);
    gsap.set(browser, {clearProps:'width,height,borderRadius'});
    gsap.set('#phoneWrap', {clearProps:'top,opacity,scale,x,y'});
    gsap.set(['#fb1','#fb2cap','#fb3','#fb4'], {clearProps:'opacity,y'});
    gsap.set(browser, {height: natH()});
    bw0 = BW(); nh0 = natH(); pw0 = PW(); ph0 = PH();
    tl.invalidate();
    ScrollTrigger.refresh();
    tl.progress(p);
  };
})();
} /* end !RM */
else {
  document.getElementById('heroFilm').classList.add('flat');
  document.querySelectorAll('.rv').forEach(el => el.style.opacity = 1);
  document.querySelectorAll('.s5').forEach(el => el.classList.add('on'));
  const f = document.getElementById('s5fill'); if (f) f.style.transform = 'none';
  document.querySelectorAll('.dx').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  document.querySelectorAll('#pricingGrid .pcard').forEach(el => el.style.opacity = 1);
  const years = parseInt(document.getElementById('yearCount').textContent, 10) || 66;
  document.querySelectorAll('#yearGrid .ydot').forEach((el, i) => { if (i < years) el.style.background = '#FF6B2C'; });
  const sfb = document.getElementById('sfBadge'); if (sfb) sfb.style.transform = 'scale(1)';
  document.getElementById('leadArea').style.opacity = 1;
  document.querySelectorAll('.ping').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  const rk = document.querySelector('#serpList .you .rk'); if (rk) rk.textContent = '1';
  const b1 = document.getElementById('rank1'); if (b1) b1.style.transform = 'scale(1)';
}
} /* end idempotency guard */
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStoreboxHome);
} else {
  initStoreboxHome();
}
