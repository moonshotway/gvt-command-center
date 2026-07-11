/* ===================== CONFIG ===================== */
const SPRINT_START = '2026-06-08';
const STORAGE_KEY = 'gvt_command_center_v1';
const DATA_VERSION = 3;

/* ===================== DATE HELPERS ===================== */
function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function todayLocal() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function getSprintDay() {
  const start = parseLocalDate(SPRINT_START);
  const today = todayLocal();
  return Math.round((today - start) / 86400000) + 1;
}

/* ===================== PLAN PHASES (source of truth for plan deliverables) ===================== */
const PLAN_PHASES = [
  {
    id: 'w1', label: 'Week 1', theme: 'Foundation',
    items: [
      { text: 'Shopify store rebuilt with new brand identity', defaultDone: true },
      { text: 'Brand palette/typography locked', defaultDone: true },
      { text: '12–15 initial designs created', defaultDone: true },
      { text: 'Samples ordered from Printify', defaultDone: true }
    ]
  },
  {
    id: 'w2', label: 'Week 2', theme: 'Channel Setup + IG Test',
    items: [
      { text: 'First 10 listings published on Shopify', defaultDone: true },
      { text: 'Etsy shop created, 10 listings', defaultDone: false },
      { text: 'TikTok Shop application submitted', defaultDone: false },
      { text: 'Email capture installed (Klaviyo)', defaultDone: true },
      { text: 'IG test: 3 posts/7 days on @goodvibes_tee', defaultDone: true },
      { text: '$10 paid boost on one @goodvibes_tee post', defaultDone: false },
      { text: 'Ifscarlet_KA introduction post', defaultDone: true }
    ]
  },
  {
    id: 'w3', label: 'Week 3', theme: 'Decision Points + Traffic Start',
    items: [
      { text: 'IG test results reviewed, keep/abandon decision locked', defaultDone: false },
      { text: 'Samples quality-checked', defaultDone: false },
      { text: 'Real product photography session (non-AI)', defaultDone: false },
      { text: 'Listings updated with real photos', defaultDone: false },
      { text: 'First Meta ad campaign live', defaultDone: false },
      { text: 'TikTok organic cadence 2–3x/week', defaultDone: false },
      { text: 'Catalog expansion to 20–25 listings', defaultDone: true }
    ]
  },
  {
    id: 'w4', label: 'Week 4', theme: 'Soft Launch + First Sales',
    items: [
      { text: 'Public launch communications across channels', defaultDone: false },
      { text: 'Ifscarlet_KA relaunch announcement story', defaultDone: false },
      { text: 'Email sent to existing GVT contacts', defaultDone: false },
      { text: 'Ad set optimization (kill/scale)', defaultDone: false },
      { text: 'TikTok Shop live, top 10 SKUs listed', defaultDone: false },
      { text: 'AI Agent #1 build researched/scoped', defaultDone: false }
    ]
  },
  {
    id: 'm2', label: 'Month 2', theme: 'Scale What Works',
    items: [
      { text: 'Catalog expansion to 50–60 SKUs', defaultDone: false },
      { text: 'Scale Meta ad spend on ROAS-positive campaigns', defaultDone: false },
      { text: 'TikTok Shop live, 5–10 creator outreach', defaultDone: false },
      { text: 'Email automation (post-purchase, abandoned cart, second-purchase)', defaultDone: false },
      { text: 'AI Agent #1 built and deployed', defaultDone: false },
      { text: 'July 4 Americana capsule reactivated', defaultDone: false },
      { text: 'Ifscarlet_KA cadence scaled to 2x/post', defaultDone: false }
    ]
  },
  {
    id: 'm3', label: 'Month 3', theme: 'Push to Target', collapsed: true,
    items: [
      { text: 'Catalog to 80–120 listings', defaultDone: false },
      { text: 'Back-to-school push', defaultDone: false },
      { text: 'Amazon Merch on Demand live', defaultDone: false },
      { text: 'Audience broadening', defaultDone: false },
      { text: 'AI Agent #2 built', defaultDone: false },
      { text: 'Public case-study content piece', defaultDone: false },
      { text: '2–3 AI services prospect conversations', defaultDone: false }
    ]
  }
];

/* ===================== STATIC SEED DATA ===================== */
const ROADMAP = [
  {
    id: 'w1', label: 'Week 1', dates: 'Jun 8–14', theme: 'Brand Foundation',
    planned: ['Brand statement lock','Logo refresh','Shopify admin audit','Theme customization','12–15 designs created','Samples ordered'],
    target: 'Refreshed Shopify store live with new brand identity, 12–15 designs, samples ordered',
    actualNotes: ''
  },
  {
    id: 'w2', label: 'Week 2', dates: 'Jun 15–21', theme: 'Channel Setup + IG Test',
    planned: ['First 10 listings published','Etsy shop created + 10 listings','TikTok Shop application','Klaviyo / email capture installed','IG test protocol (3 posts / 7 days)','Ifscarlet_KA introduction story'],
    target: 'Shopify + Etsy live with 10+ listings, TikTok Shop applied, email capture active, IG test running, Ifscarlet_KA intro made',
    actualNotes: 'Etsy and TikTok Shop deferred to Month 2 (deliberate decision). Heavy Printify infrastructure crisis consumed most of week (product purge during dormancy, OAuth reauthorization issues). Shopify listings work continued into Week 3.'
  },
  {
    id: 'w3', label: 'Week 3', dates: 'Jun 22–28', theme: 'Decision Points + Traffic Start',
    planned: ['IG test results review','Samples QC','Real product photography','Listings updated with real photos','First Meta ad campaign','TikTok organic cadence','Catalog expansion to 20–25 listings'],
    target: 'Real product photos live, first paid ads running, TikTok cadence established, IG path decided, 20–25 listings',
    actualNotes: 'Catalog reached 16 products by end of week (not 20–25). AI-generated lifestyle hero images used instead of physical sample photography. Meta ads and TikTok organic not yet started. Ifscarlet_KA intro reel posted Day 22 (Jun 29) — first major external touchpoint, slightly delayed from original Week 2 target but executed.'
  },
  {
    id: 'w4', label: 'Week 4', dates: 'Jun 29–Jul 5', theme: 'Soft Launch + First Sales',
    planned: ['Public launch communications across channels','Ifscarlet_KA relaunch announcement','Ad set optimization','TikTok Shop listings live','AI agent #1 scoped'],
    target: 'Cumulative revenue $1,500–$3,500, TikTok Shop listings live, ads optimized, AI agent #1 scoped',
    actualNotes: 'In progress as of Day 23. Ifscarlet_KA reel posted and live. Klaviyo email capture set up (domain verified, sending configured) — ahead of original Week 2 placement for this item. Free shipping and checkout bugs fixed. 16 products live, targeting 20. TikTok Shop still deferred to Month 2.'
  },
  {
    id: 'm2', label: 'Month 2', dates: 'Jul 6–Aug 2', theme: 'Scale What Works',
    planned: ['Catalog to 50–60 SKUs','Scale ad spend on ROAS-positive campaigns','TikTok Shop live + micro-creator outreach','Email automation (welcome / abandoned cart / post-purchase)','AI Agent #1 built','July 4 Americana capsule reactivation','Increased Ifscarlet_KA cadence'],
    target: 'Monthly revenue $3,000–$5,500, AI Agent #1 live, 50–60 SKUs, TikTok affiliate active, email automation deployed',
    actualNotes: ''
  },
  {
    id: 'm3', label: 'Month 3', dates: 'Aug 3–30', theme: 'Push to Target',
    planned: ['Catalog to 80–120 listings','Back-to-school push','Amazon Merch on Demand live','Audience broadening beyond KA niche','AI Agent #2 built','First public content about the AI+POD workflow','AI services prospect conversations opened'],
    target: 'ORIGINAL: Monthly revenue $5,000–$8,000, net profit $2,000–$3,500, two AI agents live, AI services pipeline opened. REVISED: Monthly revenue $1,500–$3,500',
    actualNotes: ''
  }
];

const REVENUE_TARGETS = [
  { month: 'Month 1 (end of Week 4)', original: '$1,500 – $3,500', revised: 'Unchanged', status: 'Missed — $0 actual' },
  { month: 'Month 2', original: '$3,000 – $5,500', revised: 'Unchanged', status: 'In progress' },
  { month: 'Month 3', original: '$5,000 – $8,000', revised: '$1,500 – $3,500 (revised down ~Day 20)', status: 'Upcoming' }
];

const SEED_ADDITIONAL = [
  { text: '4 new products published (reached 16 total)', done: true, phaseTag: 'unplanned' },
  { text: 'Free shipping bug fixed (Printify shipping profile assignment)', done: true, phaseTag: 'unplanned' },
  { text: 'Klaviyo selected as email platform', done: true, phaseTag: 'unplanned' },
  { text: 'Naming convention locked: [Design Name] Unisex Tee / Women\'s Tee / Hoodie', done: true, phaseTag: 'unplanned' },
  { text: 'Hero image direction set: 70% candid editorial', done: true, phaseTag: 'unplanned' },
  { text: 'Ifscarlet_KA intro reel posted', done: true, phaseTag: 'unplanned' },
  { text: 'Klaviyo popup design + copy', done: false, phaseTag: 'unplanned' },
  { text: 'Klaviyo welcome flow (2–3 emails)', done: false, phaseTag: 'unplanned' },
  { text: 'Collections rename + nav wiring (Unisex Tees / Women\'s Tees)', done: false, phaseTag: 'unplanned' },
  { text: 'Size chart HTML fix on legacy products', done: false, phaseTag: 'unplanned' },
  { text: 'Coffee Can Wait Women\'s Tee decision', done: false, phaseTag: 'unplanned' },
  { text: 'Zoho email alias setup (mail@goodvibestee.com)', done: false, phaseTag: 'unplanned' },
  { text: 'Border Collie Breed Study Unisex Tee — designed, published to Shopify', done: true, phaseTag: 'unplanned' },
  { text: 'Popup A/B test live: Early Access vs. 15% Discount', done: true, phaseTag: 'unplanned' },
  { text: '@goodvibes_tee Border Collie post published', done: true, phaseTag: 'unplanned' },
  { text: 'Full sprint review conducted — Day 33', done: true, phaseTag: 'unplanned' },
  { text: 'GVT Command Center built and deployed to Netlify', done: true, phaseTag: 'unplanned' }
];

const SEED_PRODUCTS = [
  { name: 'My Dog Is My Therapist Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Good Vibes Only Unisex Tee', price: '29.99', status: 'live' },
  { name: 'My Dog Has Better Manners Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'Mom and Her Dog Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'My Furry BFF Hoodie', price: '', status: 'live' },
  { name: 'My Furry BFF Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'My Furry BFF Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Top Dog Fur Force Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Daisy by Daisy Unisex Tee', price: '29.99', status: 'live' },
  { name: 'The Cuddle Dealer Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Love Has Four Paws Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'Certified Mutt Unisex Tee', price: '29.99', status: 'live' },
  { name: 'My Dog Is The Best Breed Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Freedom. Found On Four Paws. Unisex Tee', price: '29.99', status: 'live' },
  { name: 'Dog Person Definition Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'Home Collection — Paw & Hand Women\'s Tee', price: '31.99', status: 'live' },
  { name: 'Border Collie Breed Study Unisex Tee', price: '', status: 'live' },
  { name: 'Product 18', price: '', status: 'live' },
  { name: 'Product 19', price: '', status: 'live' },
  { name: 'Product 20', price: '', status: 'live' },
  { name: 'Product 21', price: '', status: 'live' },
  { name: 'Product 22', price: '', status: 'live' }
];

const SEED_DECISIONS = [
  { date: '2026-06-08', text: 'Day 1 reset, sprint officially begins' },
  { date: '2026-06-18', text: 'Printify product purge discovered during dormancy recovery — major infrastructure blocker, consumed most of session' },
  { date: '2026-06-18', text: 'Decided "Keep individual product details" only protects existing connections, not new publishes — learned the hard way after duplicate products created' },
  { date: '2026-06-25', text: 'Naming convention locked — [Design Name] Unisex Tee / Women\'s Tee / Hoodie' },
  { date: '2026-06-25', text: 'Hero image direction — 70% candid editorial' },
  { date: '2026-06-26', text: 'Shopify upgraded to Basic plan ($39/mo), 4 new products published' },
  { date: '2026-06-27', text: 'Month 3 revenue target revised down from $5K–$8K to $1,500–$3,500' },
  { date: '2026-06-29', text: 'Free shipping bug fixed — Printify shipping profile required manual product assignment, not automatic' },
  { date: '2026-06-29', text: 'Klaviyo selected for email over Mailchimp (no native Shopify integration) and Privy (low familiarity) — chosen for Shopify integration depth' },
  { date: '2026-06-29', text: 'Ifscarlet_KA intro reel posted — first major external touchpoint, 34 visitors within hours of posting' },
  { date: '2026-06-30', text: 'Command Center rebuild moved from chat-interface artifacts to Claude Code for proper dev environment' },
  { date: '2026-07-07', text: 'New series launched: Breed Study — fine-art single-color breed portraits, pivoting from font/icon series. Breed order: mixed, no strict audience-priority sequencing.' },
  { date: '2026-07-07', text: 'Popup offer A/B test launched — testing whether no-coupon positioning was suppressing signups (0 organic signups / 80 views prior to test).' },
  { date: '2026-07-07', text: '@goodvibes_tee IG activity tracked as individual deliverable entries, not a structured counter, to keep CC maintenance light.' },
  { date: '2026-07-10', text: 'Sprint review conducted Day 33 (Jul 10, Week 5). Month 1 revenue target ($2,500-$4,000 cumulative) missed — actual revenue $0. Root causes identified: Ifscarlet_KA warm audience under-utilized (1 touch in 5 weeks vs. planned Wed/Sat cadence), Command Center/infrastructure work consumed disproportionate time relative to direct GVT revenue impact, Etsy and TikTok Shop channels not launched as planned. Catalog build (22 products, 3 series) and brand identity execution assessed as strong; sales channel activation assessed as the clear gap.' },
  { date: '2026-07-10', text: 'Week 6 objective locked: break the zero-sales streak by end of week (target Jul 17). Action plan: (1) Ifscarlet_KA minimum 3 posts/week resumed as top priority, (2) no further CC/tooling work unless something breaks, (3) monitor popup A/B test mid-week, act on winning variant, (4) @goodvibes_tee keep/abandon decision moved up to ~Jul 17 (from original 3-week window) given weak signal so far.' }
];

const SEED_HOURS = {
  '2026-06-29-backfill': { date: '2026-06-29', label: 'Backfill (Day 1–22 prior hours)', gvt: 43, ai: 9 },
  '2026-06-28': { date: '2026-06-28', label: 'Backfill — week of Jun 22-28', gvt: 40, ai: 0 },
  '2026-07-05': { date: '2026-07-05', label: 'Backfill — week of Jun 29-Jul 5', gvt: 20, ai: 0 },
  '2026-07-06': { date: '2026-07-06', gvt: 5, ai: 0 },
  '2026-07-07': { date: '2026-07-07', gvt: 4, ai: 0 }
};

/* ===================== PLAN ITEMS HELPERS ===================== */
function buildDefaultPlanItems() {
  const planItems = {};
  PLAN_PHASES.forEach(phase => {
    phase.items.forEach((item, i) => {
      planItems[`${phase.id}-${i}`] = item.defaultDone;
    });
  });
  return planItems;
}

// Compute overall plan % including tagged additional deliverables
function getPlanProgress(s) {
  let total = 0, done = 0;
  PLAN_PHASES.forEach(phase => {
    phase.items.forEach((_, i) => {
      total++;
      if (s.planItems[`${phase.id}-${i}`]) done++;
    });
    // Tagged additional deliverables roll into their phase count
    (s.additionalDeliverables || []).forEach(d => {
      if (d.phaseTag === phase.id) { total++; if (d.done) done++; }
    });
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

// Current phase = earliest phase still having any incomplete item
function getCurrentPhase(s) {
  for (const phase of PLAN_PHASES) {
    const hasIncomplete = phase.items.some((_, i) => !s.planItems[`${phase.id}-${i}`])
      || (s.additionalDeliverables || []).some(d => d.phaseTag === phase.id && !d.done);
    if (hasIncomplete) return phase.label;
  }
  return 'Complete!';
}

/* ===================== SEED STATE ===================== */
function buildSeedState() {
  const planStatus = {};
  ROADMAP.forEach(period => {
    period.planned.forEach((_, i) => { planStatus[`${period.id}-${i}`] = 'pending'; });
  });
  return {
    seeded: true,
    dataVersion: DATA_VERSION,
    streak: 16,
    hours: { ...SEED_HOURS },
    additionalDeliverables: SEED_ADDITIONAL.map((d, i) => ({ id: 'd' + i, ...d })),
    products: SEED_PRODUCTS.map((p, i) => ({ id: 'p' + i, ...p })),
    decisions: SEED_DECISIONS.map((d, i) => ({ id: 'k' + i, ...d })),
    planStatus,
    planItems: buildDefaultPlanItems(),
    actualNotes: Object.fromEntries(ROADMAP.map(p => [p.id, p.actualNotes]))
  };
}

/* ===================== MIGRATIONS ===================== */
function applyMigrations(s) {
  const v = s.dataVersion || 0;
  if (v >= DATA_VERSION) return s;

  if (v < 1) {
    s.deliverables = s.deliverables || [];
    const nd = [
      { text: 'Border Collie Breed Study Unisex Tee — designed, published to Shopify', done: true },
      { text: 'Popup A/B test live: Early Access vs. 15% Discount', done: true },
      { text: '@goodvibes_tee Border Collie post published', done: true }
    ];
    nd.forEach(d => s.deliverables.push({ id: uid('d'), ...d }));
    s.products.push({ id: uid('p'), name: 'Border Collie Breed Study Unisex Tee', price: '', status: 'live' });
    [
      { date: '2026-07-07', text: 'New series launched: Breed Study — fine-art single-color breed portraits, pivoting from font/icon series. Breed order: mixed, no strict audience-priority sequencing.' },
      { date: '2026-07-07', text: 'Popup offer A/B test launched — testing whether no-coupon positioning was suppressing signups (0 organic signups / 80 views prior to test).' },
      { date: '2026-07-07', text: '@goodvibes_tee IG activity tracked as individual deliverable entries, not a structured counter, to keep CC maintenance light.' }
    ].forEach(d => s.decisions.push({ id: uid('k'), ...d }));
    s.hours['2026-06-28'] = { date: '2026-06-28', label: 'Backfill — week of Jun 22-28', gvt: 40, ai: 0 };
    s.hours['2026-07-05'] = { date: '2026-07-05', label: 'Backfill — week of Jun 29-Jul 5', gvt: 20, ai: 0 };
    s.hours['2026-07-06'] = { date: '2026-07-06', gvt: 5, ai: 0 };
    s.hours['2026-07-07'] = { date: '2026-07-07', gvt: 4, ai: 0 };
  }

  if (v < 2) {
    s.deliverables = s.deliverables || [];
    [
      { date: '2026-07-10', text: 'Sprint review conducted Day 33 (Jul 10, Week 5). Month 1 revenue target ($2,500-$4,000 cumulative) missed — actual revenue $0. Root causes identified: Ifscarlet_KA warm audience under-utilized (1 touch in 5 weeks vs. planned Wed/Sat cadence), Command Center/infrastructure work consumed disproportionate time relative to direct GVT revenue impact, Etsy and TikTok Shop channels not launched as planned. Catalog build (22 products, 3 series) and brand identity execution assessed as strong; sales channel activation assessed as the clear gap.' },
      { date: '2026-07-10', text: 'Week 6 objective locked: break the zero-sales streak by end of week (target Jul 17). Action plan: (1) Ifscarlet_KA minimum 3 posts/week resumed as top priority, (2) no further CC/tooling work unless something breaks, (3) monitor popup A/B test mid-week, act on winning variant, (4) @goodvibes_tee keep/abandon decision moved up to ~Jul 17 (from original 3-week window) given weak signal so far.' }
    ].forEach(d => s.decisions.push({ id: uid('k'), ...d }));
    s.deliverables.push({ id: uid('d'), text: 'Full sprint review conducted — Day 33', done: true });
  }

  if (v < 3) {
    // Migrate flat deliverables → additionalDeliverables with phaseTag
    const old = s.deliverables || [];
    s.additionalDeliverables = old.map(d => ({ ...d, phaseTag: d.phaseTag || 'unplanned' }));
    delete s.deliverables;
    // Initialize planItems from PLAN_PHASES defaults
    s.planItems = buildDefaultPlanItems();
  }

  s.dataVersion = DATA_VERSION;
  return s;
}

/* ===================== STATE / PERSISTENCE ===================== */
let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const migrated = applyMigrations(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch (e) { /* fall through */ }
  }
  const seeded = buildSeedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===================== RENDER: HEADER ===================== */
function renderDayCounter() {
  document.getElementById('dayNumber').textContent = getSprintDay();
  document.getElementById('dayDate').textContent = todayLocal().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ===================== RENDER: STATS ===================== */
function renderStats() {
  document.getElementById('streakValue').textContent = state.streak;

  const totals = Object.values(state.hours).reduce((acc, e) => {
    acc.gvt += Number(e.gvt) || 0;
    acc.ai += Number(e.ai) || 0;
    return acc;
  }, { gvt: 0, ai: 0 });
  document.getElementById('totalGvtHours').textContent = totals.gvt.toFixed(2).replace(/\.00$/, '');
  document.getElementById('totalAiHours').textContent = totals.ai.toFixed(2).replace(/\.00$/, '');
  document.getElementById('productCount').textContent = state.products.length;

  const { pct } = getPlanProgress(state);
  document.getElementById('deliverablesPct').textContent = pct + '%';
  document.getElementById('currentPhase').textContent = getCurrentPhase(state);
}

document.getElementById('editStreakBtn').addEventListener('click', () => {
  const val = prompt('Update current streak (days):', state.streak);
  if (val === null) return;
  const num = parseInt(val, 10);
  if (!isNaN(num) && num >= 0) { state.streak = num; saveState(); renderStats(); }
});

/* ===================== RENDER: PLAN PHASES ===================== */
function renderPlanPhases() {
  const container = document.getElementById('planPhaseList');
  container.innerHTML = '';

  PLAN_PHASES.forEach(phase => {
    // Count done items including tagged additional deliverables
    const planDone = phase.items.filter((_, i) => state.planItems[`${phase.id}-${i}`]).length;
    const tagged = (state.additionalDeliverables || []).filter(d => d.phaseTag === phase.id);
    const taggedDone = tagged.filter(d => d.done).length;
    const totalCount = phase.items.length + tagged.length;
    const doneCount = planDone + taggedDone;

    const card = document.createElement('div');
    card.className = 'phase-card' + (phase.collapsed ? '' : '');
    card.dataset.id = phase.id;

    const isComplete = doneCount === totalCount && totalCount > 0;
    const badge = isComplete ? ' complete-badge' : '';

    card.innerHTML = `
      <div class="phase-head" data-id="${phase.id}">
        <div class="phase-head-left">
          <span class="phase-label">${phase.label}</span>
          <span class="phase-theme">${phase.theme}</span>
        </div>
        <span class="phase-count${badge}">${doneCount}/${totalCount}</span>
      </div>
      <ul class="plan-item-list phase-body" id="phase-body-${phase.id}"></ul>
    `;

    // Default collapsed state: Month 3 starts collapsed, others open
    if (!phase.collapsed) card.classList.add('open');

    card.querySelector('.phase-head').addEventListener('click', () => card.classList.toggle('open'));

    const ul = card.querySelector(`#phase-body-${phase.id}`);

    // Plan items
    phase.items.forEach((item, i) => {
      const key = `${phase.id}-${i}`;
      const done = !!state.planItems[key];
      const li = document.createElement('li');
      li.className = 'plan-item' + (done ? ' done' : '');
      li.innerHTML = `
        <input type="checkbox" ${done ? 'checked' : ''}>
        <span class="plan-item-text">${escapeHtml(item.text)}</span>
      `;
      li.querySelector('input').addEventListener('change', (e) => {
        state.planItems[key] = e.target.checked;
        li.className = 'plan-item' + (e.target.checked ? ' done' : '');
        saveState();
        renderPlanPhases();
        renderStats();
      });
      ul.appendChild(li);
    });

    // Tagged additional deliverables shown inline under their phase
    tagged.forEach(d => {
      const li = document.createElement('li');
      li.className = 'plan-item plan-item-extra' + (d.done ? ' done' : '');
      li.innerHTML = `
        <input type="checkbox" ${d.done ? 'checked' : ''}>
        <span class="plan-item-text">${escapeHtml(d.text)}</span>
        <span class="extra-badge">extra</span>
      `;
      li.querySelector('input').addEventListener('change', (e) => {
        d.done = e.target.checked;
        li.className = 'plan-item plan-item-extra' + (e.target.checked ? ' done' : '');
        saveState();
        renderPlanPhases();
        renderAdditionalDeliverables();
        renderStats();
      });
      ul.appendChild(li);
    });

    container.appendChild(card);
  });
}

/* ===================== RENDER: ADDITIONAL DELIVERABLES ===================== */
function renderAdditionalDeliverables() {
  const list = document.getElementById('deliverableList');
  list.innerHTML = '';
  (state.additionalDeliverables || []).forEach(item => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';
    const tagLabel = item.phaseTag && item.phaseTag !== 'unplanned'
      ? `<span class="phase-tag-badge">${item.phaseTag.toUpperCase()}</span>` : '';
    li.innerHTML = `
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <span class="delv-text" contenteditable="true">${escapeHtml(item.text)}</span>
      ${tagLabel}
      <button class="btn-text danger">Delete</button>
    `;
    const checkbox = li.querySelector('input');
    const textEl = li.querySelector('.delv-text');

    checkbox.addEventListener('change', () => {
      item.done = checkbox.checked;
      saveState();
      renderAdditionalDeliverables();
      renderPlanPhases();
      renderStats();
    });
    textEl.addEventListener('blur', () => {
      const t = textEl.textContent.trim();
      if (t) { item.text = t; saveState(); } else { textEl.textContent = item.text; }
    });
    li.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this item?')) {
        state.additionalDeliverables = state.additionalDeliverables.filter(d => d.id !== item.id);
        saveState();
        renderAdditionalDeliverables();
        renderPlanPhases();
        renderStats();
      }
    });
    list.appendChild(li);
  });
}

document.getElementById('deliverableForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('deliverableText').value.trim();
  const phaseTag = document.getElementById('deliverablePhaseTag').value;
  if (!text) return;
  state.additionalDeliverables.push({ id: uid('d'), text, done: false, phaseTag });
  saveState();
  renderAdditionalDeliverables();
  renderPlanPhases();
  renderStats();
  e.target.reset();
});

/* ===================== HOURS LOG ===================== */
function renderHours() {
  const tbody = document.getElementById('hoursTableBody');
  tbody.innerHTML = '';
  const entries = Object.entries(state.hours)
    .sort((a, b) => (b[1].date || '').localeCompare(a[1].date || ''));
  entries.forEach(([key, e]) => {
    const total = (Number(e.gvt) || 0) + (Number(e.ai) || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.label || e.date}</td>
      <td>${e.gvt}</td>
      <td>${e.ai}</td>
      <td>${total}</td>
      <td><button class="btn-text danger" data-key="${key}">Delete</button></td>
    `;
    tr.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this hours entry?')) {
        delete state.hours[key];
        saveState(); renderHours(); renderStats();
      }
    });
    tbody.appendChild(tr);
  });
}

document.getElementById('hoursForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const dateVal = document.getElementById('hoursDate').value;
  const gvt = parseFloat(document.getElementById('hoursGvt').value) || 0;
  const ai = parseFloat(document.getElementById('hoursAi').value) || 0;
  if (!dateVal) return;
  state.hours[dateVal] = { date: dateVal, gvt, ai };
  saveState(); renderHours(); renderStats();
  e.target.reset();
});

/* ===================== PLAN VS ACTUAL ===================== */
function renderRoadmap() {
  const container = document.getElementById('roadmapList');
  container.innerHTML = '';
  ROADMAP.forEach(period => {
    const card = document.createElement('div');
    card.className = 'period-card';
    card.dataset.id = period.id;

    const head = document.createElement('div');
    head.className = 'period-head';
    head.innerHTML = `<div><h3>${period.label} — ${period.theme}</h3><span class="period-meta">${period.dates}</span></div>`;
    head.addEventListener('click', () => card.classList.toggle('open'));

    const body = document.createElement('div');
    body.className = 'period-body';
    const cols = document.createElement('div');
    cols.className = 'period-cols';

    const plannedCol = document.createElement('div');
    plannedCol.className = 'period-col';
    plannedCol.innerHTML = `<h4>Planned</h4>`;
    period.planned.forEach((itemText, i) => {
      const key = `${period.id}-${i}`;
      const status = state.planStatus[key] || 'pending';
      const row = document.createElement('div');
      row.className = 'planned-item';
      row.innerHTML = `
        <span>${escapeHtml(itemText)}</span>
        <select class="status-select status-${status}">
          <option value="pending" ${status==='pending'?'selected':''}>Pending</option>
          <option value="on-track" ${status==='on-track'?'selected':''}>On track</option>
          <option value="ahead" ${status==='ahead'?'selected':''}>Ahead</option>
          <option value="deferred" ${status==='deferred'?'selected':''}>Deferred</option>
          <option value="done" ${status==='done'?'selected':''}>Done</option>
        </select>`;
      const select = row.querySelector('select');
      select.addEventListener('change', () => {
        state.planStatus[key] = select.value;
        select.className = `status-select status-${select.value}`;
        saveState();
      });
      plannedCol.appendChild(row);
    });

    const actualCol = document.createElement('div');
    actualCol.className = 'period-col';
    actualCol.innerHTML = `<h4>Actual / Current Status</h4>
      <textarea class="actual-notes" placeholder="What actually happened this period...">${escapeHtml(state.actualNotes[period.id] || '')}</textarea>`;
    actualCol.querySelector('textarea').addEventListener('blur', (ev) => {
      state.actualNotes[period.id] = ev.target.value; saveState();
    });

    cols.appendChild(plannedCol);
    cols.appendChild(actualCol);
    const targetBox = document.createElement('div');
    targetBox.className = 'target-box';
    targetBox.innerHTML = `<strong>End-of-period target:</strong> ${escapeHtml(period.target)}`;
    body.appendChild(cols);
    body.appendChild(targetBox);
    card.appendChild(head);
    card.appendChild(body);
    container.appendChild(card);
  });

  const d = getSprintDay();
  const pid = d <= 7 ? 'w1' : d <= 14 ? 'w2' : d <= 21 ? 'w3' : d <= 28 ? 'w4' : d <= 56 ? 'm2' : 'm3';
  const open = container.querySelector(`.period-card[data-id="${pid}"]`);
  if (open) open.classList.add('open');
}

/* ===================== REVENUE TARGETS ===================== */
function renderRevenue() {
  const tbody = document.getElementById('revenueTableBody');
  tbody.innerHTML = '';
  REVENUE_TARGETS.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.month}</td><td>${r.original}</td><td>${r.revised}</td><td>${r.status}</td>`;
    tbody.appendChild(tr);
  });
}

/* ===================== PRODUCT CATALOG ===================== */
function renderProducts() {
  const tbody = document.getElementById('productTableBody');
  tbody.innerHTML = '';
  document.getElementById('catalogCountBadge').textContent = state.products.length;
  state.products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td contenteditable="true" class="edit-name">${escapeHtml(p.name)}</td>
      <td contenteditable="true" class="edit-price">${escapeHtml(p.price || '')}</td>
      <td><select class="status-pick">
        <option value="live" ${p.status==='live'?'selected':''}>Live</option>
        <option value="draft" ${p.status==='draft'?'selected':''}>Draft</option>
      </select></td>
      <td><button class="btn-text danger">Delete</button></td>`;
    tr.querySelector('.edit-name').addEventListener('blur', e => { p.name = e.target.textContent.trim() || p.name; saveState(); });
    tr.querySelector('.edit-price').addEventListener('blur', e => { p.price = e.target.textContent.trim(); saveState(); });
    tr.querySelector('.status-pick').addEventListener('change', e => { p.status = e.target.value; saveState(); });
    tr.querySelector('button').addEventListener('click', () => {
      if (confirm(`Delete "${p.name}"?`)) {
        state.products = state.products.filter(x => x.id !== p.id);
        saveState(); renderProducts(); renderStats();
      }
    });
    tbody.appendChild(tr);
  });
}

document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('productName').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  const status = document.getElementById('productStatus').value;
  if (!name) return;
  state.products.push({ id: uid('p'), name, price, status });
  saveState(); renderProducts(); renderStats();
  e.target.reset();
});

/* ===================== DECISIONS LOG ===================== */
function renderDecisions() {
  const list = document.getElementById('decisionList');
  list.innerHTML = '';
  [...state.decisions].sort((a, b) => b.date.localeCompare(a.date)).forEach(d => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="decision-date">${formatDisplayDate(d.date)}</span>
      <span class="decision-text" contenteditable="true">${escapeHtml(d.text)}</span>
      <button class="btn-text danger">Delete</button>`;
    li.querySelector('.decision-text').addEventListener('blur', e => {
      const t = e.target.textContent.trim();
      if (t) { d.text = t; saveState(); } else { e.target.textContent = d.text; }
    });
    li.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this decision?')) {
        state.decisions = state.decisions.filter(x => x.id !== d.id);
        saveState(); renderDecisions();
      }
    });
    list.appendChild(li);
  });
}

document.getElementById('decisionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const date = document.getElementById('decisionDate').value;
  const text = document.getElementById('decisionText').value.trim();
  if (!date || !text) return;
  state.decisions.push({ id: uid('k'), date, text });
  saveState(); renderDecisions();
  e.target.reset();
  document.getElementById('decisionDate').value = formatLocalDate(todayLocal());
});

/* ===================== UTIL ===================== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function formatDisplayDate(iso) {
  return parseLocalDate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ===================== INIT ===================== */
function init() {
  const today = formatLocalDate(todayLocal());
  document.getElementById('hoursDate').value = today;
  document.getElementById('decisionDate').value = today;
  renderDayCounter();
  renderStats();
  renderPlanPhases();
  renderAdditionalDeliverables();
  renderHours();
  renderRoadmap();
  renderRevenue();
  renderProducts();
  renderDecisions();
}

init();
