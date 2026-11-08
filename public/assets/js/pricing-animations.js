
function initStoreboxPricing() {
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => gsap.utils.toArray(s);

/* ---------- billing + store toggles ---------- */
// Base monthly prices + currency are read from the data-sb-var-tagged spans
// in the markup rather than hardcoded here, so the backend's locale
// substitution (which rewrites those elements server-side before this
// script ever runs) carries through to the interactive monthly/yearly
// toggle too, instead of being silently overwritten back to USD.
const currency = $('#curSite').textContent;
// Keep the original authored/localized text for exact monthly redisplay —
// parsing it to a number and reformatting would drop thousands separators
// (e.g. "1,899" -> 1899 -> "1899"). The number is only needed for the
// yearly math below.
const priceWebsiteMoText = $('#pSite').textContent;
const priceStoreMoText = $('#pStore').textContent;
const priceSeoMoText = $('#pSeo').textContent;
// parseFloat stops at the first non-numeric character, so "1,899" would
// silently parse as 1 — strip thousands separators before parsing.
const parsePrice = text => parseFloat(text.replace(/,/g, ''));
const priceWebsiteMo = parsePrice(priceWebsiteMoText);
const priceStoreMo = parsePrice(priceStoreMoText);
const priceSeoMo = parsePrice(priceSeoMoText);
// Whether to show cents in computed yearly prices is a currency property,
// not a property of any one price — USD ($) is cents-based regardless of
// whether a given plan happens to be a round dollar amount (e.g. "$99"),
// while whole-currency locales (₹) should never show decimals, rounding up
// instead so the yearly-equivalent is never quoted below its true value.
const useCents = currency === '$';

// Annual billing is 2 months free — equivalent to paying for 10 of 12 months.
const ANNUAL_MONTHS = 10;
function withThousands(n, useCents) {
  const value = useCents ? Math.round(n * 100) / 100 : Math.ceil(n);
  const [intPart, decPart] = useCents
    ? value.toFixed(Number.isInteger(value) ? 0 : 2).split('.')
    : [String(value), undefined];
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${groupedInt}.${decPart}` : groupedInt;
}
const yearlyMonthlyEquivalent = mo => withThousands(mo * ANNUAL_MONTHS / 12, useCents);
const yearlyTotal = mo => withThousands(mo * ANNUAL_MONTHS, useCents);

let bill = 'mo';

const bump = el => { if (!RM) gsap.fromTo(el, {scale:.88, opacity:.4}, {scale:1, opacity:1, duration:.4, ease:'back.out(2)'}); };
function renderPrices(){
  $('#pSite').textContent = bill === 'mo' ? priceWebsiteMoText : yearlyMonthlyEquivalent(priceWebsiteMo);
  $('#pStore').textContent = bill === 'mo' ? priceStoreMoText : yearlyMonthlyEquivalent(priceStoreMo);
  $('#pSeo').textContent = bill === 'mo' ? priceSeoMoText : yearlyMonthlyEquivalent(priceSeoMo);
  $('#bSite').innerHTML = bill === 'mo' ? 'Billed monthly' : `Billed annually — <b>2 months free</b> (${currency}${yearlyTotal(priceWebsiteMo)}/yr)`;
  $('#bStore').innerHTML = bill === 'mo' ? 'Billed monthly' : `Billed annually — <b>2 months free</b> (${currency}${yearlyTotal(priceStoreMo)}/yr)`;
  $('#bSeo').innerHTML = bill === 'mo' ? 'Billed monthly' : `Billed annually — <b>2 months free</b> (${currency}${yearlyTotal(priceSeoMo)}/yr)`;
  bump($('#pSite').parentNode); bump($('#pStore').parentNode); bump($('#pSeo').parentNode);
}
function moveSlide(){
  const on = $('#btPill .bt-opt.on'), slide = $('#btSlide');
  slide.style.left = on.offsetLeft + 'px';
  slide.style.width = on.offsetWidth + 'px';
}
$$('#btPill .bt-opt').forEach(b => b.addEventListener('click', () => {
  $$('#btPill .bt-opt').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); bill = b.dataset.bill; moveSlide(); renderPrices();
}));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveSlide); else moveSlide();
window.addEventListener('resize', moveSlide);

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

  // dealt pricing cards on load
  gsap.from('#pricingGrid .pcard', {y:70, opacity:0, rotation: i => (i%2 ? 3 : -3),
    duration:.8, ease:'back.out(1.4)', stagger:.13, delay:.5});
  gsap.from(['.phero h1','.phero .sub','.badges'], {opacity:0, y:26, duration:.8, ease:'power3.out', stagger:.12, delay:.1});

  // testimonial cards
  ScrollTrigger.batch('.t-card', {start:'top 85%',
    onEnter: b => gsap.to(b, {opacity:1, y:0, duration:.7, ease:'power3.out', stagger:.12, overwrite:true})});

  // compare table rows sweep in
  ScrollTrigger.create({trigger:'.tbl-wrap', start:'top 78%', once:true, onEnter: () =>
    gsap.from('tbody tr', {opacity:0, x:-24, duration:.5, ease:'power2.out', stagger:.07})});

  window.addEventListener('load', () => gsap.delayedCall(.4, () => ScrollTrigger.refresh()));
} else {
  document.querySelectorAll('.rv').forEach(el => el.style.opacity = 1);
}
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStoreboxPricing);
} else {
  initStoreboxPricing();
}
