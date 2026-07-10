/* ===================== CONFIG ===================== */
const SPRINT_START = '2026-06-08'; // Day 1, local calendar date
const STORAGE_KEY = 'gvt_command_center_v1';
const DATA_VERSION = 2; // increment each time we add a migration below

/* ===================== DATE HELPERS =====================
   Parsing "YYYY-MM-DD" with `new Date(str)` reads it as UTC midnight,
   which can shift the displayed day backward depending on the user's
   timezone (the off-by-one bug mentioned in the brief). We avoid that
   by always splitting the string ourselves and building the Date from
   local Y/M/D components. */
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
  const diffDays = Math.round((today - start) / 86400000);
  return diffDays + 1; // Day 1 on the start date itself
}

/* ===================== SEED DATA ===================== */
const ROADMAP = [
  {
    id: 'w1', label: 'Week 1', dates: 'Jun 8–14', theme: 'Brand Foundation',
    planned: [
      'Brand statement lock',
      'Logo refresh',
      'Shopify admin audit',
      'Theme customization',
      '12–15 designs created',
      'Samples ordered'
    ],
    target: 'Refreshed Shopify store live with new brand identity, 12–15 designs, samples ordered',
    actualNotes: ''
  },
  {
    id: 'w2', label: 'Week 2', dates: 'Jun 15–21', theme: 'Channel Setup + IG Test',
    planned: [
      'First 10 listings published',
      'Etsy shop created + 10 listings',
      'TikTok Shop application',
      'Klaviyo / email capture installed',
      'IG test protocol (3 posts / 7 days)',
      'Ifscarlet_KA introduction story'
    ],
    target: 'Shopify + Etsy live with 10+ listings, TikTok Shop applied, email capture active, IG test running, Ifscarlet_KA intro made',
    actualNotes: 'Etsy and TikTok Shop deferred to Month 2 (deliberate decision). Heavy Printify infrastructure crisis consumed most of week (product purge during dormancy, OAuth reauthorization issues). Shopify listings work continued into Week 3.'
  },
  {
    id: 'w3', label: 'Week 3', dates: 'Jun 22–28', theme: 'Decision Points + Traffic Start',
    planned: [
      'IG test results review',
      'Samples QC',
      'Real product photography',
      'Listings updated with real photos',
      'First Meta ad campaign',
      'TikTok organic cadence',
      'Catalog expansion to 20–25 listings'
    ],
    target: 'Real product photos live, first paid ads running, TikTok cadence established, IG path decided, 20–25 listings',
    actualNotes: 'Catalog reached 16 products by end of week (not 20–25). AI-generated lifestyle hero images used instead of physical sample photography. Meta ads and TikTok organic not yet started. Ifscarlet_KA intro reel posted Day 22 (Jun 29) — first major external touchpoint, slightly delayed from original Week 2 target but executed.'
  },
  {
    id: 'w4', label: 'Week 4', dates: 'Jun 29–Jul 5', theme: 'Soft Launch + First Sales',
    planned: [
      'Public launch communications across channels',
      'Ifscarlet_KA relaunch announcement',
      'Ad set optimization',
      'TikTok Shop listings live',
      'AI agent #1 scoped'
    ],
    target: 'Cumulative revenue $1,500–$3,500, TikTok Shop listings live, ads optimized, AI agent #1 scoped',
    actualNotes: 'In progress as of Day 23. Ifscarlet_KA reel posted and live. Klaviyo email capture set up (domain verified, sending configured) — ahead of original Week 2 placement for this item. Free shipping and checkout bugs fixed. 16 products live, targeting 20. TikTok Shop still deferred to Month 2.'
  },
  {
    id: 'm2', label: 'Month 2', dates: 'Jul 6–Aug 2', theme: 'Scale What Works',
    planned: [
      'Catalog to 50–60 SKUs',
      'Scale ad spend on ROAS-positive campaigns',
      'TikTok Shop live + micro-creator outreach',
      'Email automation (welcome / abandoned cart / post-purchase)',
      'AI Agent #1 built',
      'July 4 Americana capsule reactivation',
      'Increased Ifscarlet_KA cadence'
    ],
    target: 'Monthly revenue $3,000–$5,500, AI Agent #1 live, 50–60 SKUs, TikTok affiliate active, email automation deployed',
    actualNotes: ''
  },
  {
    id: 'm3', label: 'Month 3', dates: 'Aug 3–30', theme: 'Push to Target',
    planned: [
      'Catalog to 80–120 listings',
      'Back-to-school push',
      'Amazon Merch on Demand live',
      'Audience broadening beyond KA niche',
      'AI Agent #2 built',
      'First public content about the AI+POD workflow',
      'AI services prospect conversations opened'
    ],
    target: 'ORIGINAL: Monthly revenue $5,000–$8,000, net profit $2,000–$3,500, two AI agents live, AI services pipeline opened. REVISED: Monthly revenue $1,500–$3,500',
    actualNotes: ''
  }
];

const REVENUE_TARGETS = [
  { month: 'Month 1 (end of Week 4)', original: '$1,500 – $3,500', revised: 'Unchanged', status: 'On track' },
  { month: 'Month 2', original: '$3,000 – $5,500', revised: 'Unchanged', status: 'Upcoming' },
  { month: 'Month 3', original: '$5,000 – $8,000', revised: '$1,500 – $3,500 (revised down ~Day 20)', status: 'Upcoming' }
];

const SEED_DELIVERABLES = [
  { text: '4 new products published (reached 16 total)', done: true },
  { text: 'Free shipping bug fixed (Printify shipping profile assignment)', done: true },
  { text: 'Klaviyo selected as email platform', done: true },
  { text: 'Naming convention locked: [Design Name] Unisex Tee / Women\'s Tee / Hoodie', done: true },
  { text: 'Hero image direction set: 70% candid editorial', done: true },
  { text: 'Ifscarlet_KA intro reel posted', done: true },
  { text: 'Klaviyo popup design + copy', done: false },
  { text: 'Klaviyo welcome flow (2–3 emails)', done: false },
  { text: 'Collections rename + nav wiring (Unisex Tees / Women\'s Tees)', done: false },
  { text: 'Size chart HTML fix on legacy products', done: false },
  { text: '4 more products needed to reach 20 total', done: false },
  { text: 'Coffee Can Wait Women\'s Tee decision', done: false },
  { text: 'TikTok Shop application (Month 2)', done: false },
  { text: 'GVT Instagram (@goodvibes_tee) comeback post', done: false },
  { text: 'Zoho email alias setup (mail@goodvibestee.com)', done: false },
  { text: 'Border Collie Breed Study Unisex Tee — designed, published to Shopify', done: true },
  { text: 'Popup A/B test live: Early Access vs. 15% Discount', done: true },
  { text: '@goodvibes_tee Border Collie post published', done: true },
  { text: 'Full sprint review conducted — Day 33', done: true }
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
  { name: 'Border Collie Breed Study Unisex Tee', price: '', status: 'live' }
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

// Hours: stored as one entry per calendar date (object keyed by date string).
const SEED_HOURS = {
  '2026-06-29-backfill': { date: '2026-06-29', label: 'Backfill (Day 1–22 prior hours)', gvt: 43, ai: 9 },
  '2026-06-28': { date: '2026-06-28', label: 'Backfill — week of Jun 22-28', gvt: 40, ai: 0 },
  '2026-07-05': { date: '2026-07-05', label: 'Backfill — week of Jun 29-Jul 5', gvt: 20, ai: 0 },
  '2026-07-06': { date: '2026-07-06', gvt: 5, ai: 0 },
  '2026-07-07': { date: '2026-07-07', gvt: 4, ai: 0 }
};

const DECISION_RULES = [
  'IG account: >300 reach + >25 engagements after 7-day test = keep; <100 reach + <10 engagements = fresh handle',
  'Ad kill rule: ROAS < 1.5 after 5 days + $50 spend = kill immediately',
  'Product kill rule: <2 sales in 30 days post-listing = archive',
  'Positioning pivot trigger: Month 1 revenue < $1,000 = full reassessment',
  'Audience broadening trigger: 50 total sales = broaden beyond KA niche',
  'Quality override: production judgment beats cost savings, always'
];

function buildSeedState() {
  const planStatus = {};
  ROADMAP.forEach(period => {
    period.planned.forEach((_, i) => {
      planStatus[`${period.id}-${i}`] = 'pending';
    });
  });
  return {
    seeded: true,
    streak: 16,
    hours: SEED_HOURS,
    deliverables: SEED_DELIVERABLES.map((d, i) => ({ id: 'd' + i, text: d.text, done: d.done })),
    products: SEED_PRODUCTS.map((p, i) => ({ id: 'p' + i, ...p })),
    decisions: SEED_DECISIONS.map((d, i) => ({ id: 'k' + i, ...d })),
    planStatus,
    actualNotes: Object.fromEntries(ROADMAP.map(p => [p.id, p.actualNotes]))
  };
}

/* ===================== MIGRATIONS =====================
   Each migration runs exactly once on existing data by comparing
   state.dataVersion to DATA_VERSION. New installs get everything
   via buildSeedState() so migrations only target returning visitors. */
function applyMigrations(s) {
  const v = s.dataVersion || 0;
  if (v >= DATA_VERSION) return s;

  if (v < 1) {
    // v1: Jul 7 2026 updates — new deliverables, product, decisions, hours
    const newDeliverables = [
      { text: 'Border Collie Breed Study Unisex Tee — designed, published to Shopify', done: true },
      { text: 'Popup A/B test live: Early Access vs. 15% Discount', done: true },
      { text: '@goodvibes_tee Border Collie post published', done: true }
    ];
    newDeliverables.forEach(d => s.deliverables.push({ id: uid('d'), ...d }));

    s.products.push({ id: uid('p'), name: 'Border Collie Breed Study Unisex Tee', price: '', status: 'live' });

    const newDecisions = [
      { date: '2026-07-07', text: 'New series launched: Breed Study — fine-art single-color breed portraits, pivoting from font/icon series. Breed order: mixed, no strict audience-priority sequencing.' },
      { date: '2026-07-07', text: 'Popup offer A/B test launched — testing whether no-coupon positioning was suppressing signups (0 organic signups / 80 views prior to test).' },
      { date: '2026-07-07', text: '@goodvibes_tee IG activity tracked as individual deliverable entries, not a structured counter, to keep CC maintenance light.' }
    ];
    newDecisions.forEach(d => s.decisions.push({ id: uid('k'), ...d }));

    // Hours entries — keyed by date so editing the same date later won't duplicate
    s.hours['2026-06-28'] = { date: '2026-06-28', label: 'Backfill — week of Jun 22-28', gvt: 40, ai: 0 };
    s.hours['2026-07-05'] = { date: '2026-07-05', label: 'Backfill — week of Jun 29-Jul 5', gvt: 20, ai: 0 };
    s.hours['2026-07-06'] = { date: '2026-07-06', gvt: 5, ai: 0 };
    s.hours['2026-07-07'] = { date: '2026-07-07', gvt: 4, ai: 0 };
  }

  if (v < 2) {
    // v2: Jul 10 sprint review — Day 33 decisions and deliverable
    const newDecisions = [
      { date: '2026-07-10', text: 'Sprint review conducted Day 33 (Jul 10, Week 5). Month 1 revenue target ($2,500-$4,000 cumulative) missed — actual revenue $0. Root causes identified: Ifscarlet_KA warm audience under-utilized (1 touch in 5 weeks vs. planned Wed/Sat cadence), Command Center/infrastructure work consumed disproportionate time relative to direct GVT revenue impact, Etsy and TikTok Shop channels not launched as planned. Catalog build (22 products, 3 series) and brand identity execution assessed as strong; sales channel activation assessed as the clear gap.' },
      { date: '2026-07-10', text: 'Week 6 objective locked: break the zero-sales streak by end of week (target Jul 17). Action plan: (1) Ifscarlet_KA minimum 3 posts/week resumed as top priority, (2) no further CC/tooling work unless something breaks, (3) monitor popup A/B test mid-week, act on winning variant, (4) @goodvibes_tee keep/abandon decision moved up to ~Jul 17 (from original 3-week window) given weak signal so far.' }
    ];
    newDecisions.forEach(d => s.decisions.push({ id: uid('k'), ...d }));

    s.deliverables.push({ id: uid('d'), text: 'Full sprint review conducted — Day 33', done: true });
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
    } catch (e) { /* fall through to reseed */ }
  }
  const seeded = buildSeedState();
  seeded.dataVersion = DATA_VERSION;
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
  const day = getSprintDay();
  document.getElementById('dayNumber').textContent = day;
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

  const done = state.deliverables.filter(d => d.done).length;
  const pct = state.deliverables.length ? Math.round((done / state.deliverables.length) * 100) : 0;
  document.getElementById('deliverablesPct').textContent = pct + '%';
}

document.getElementById('editStreakBtn').addEventListener('click', () => {
  const val = prompt('Update current streak (days):', state.streak);
  if (val === null) return;
  const num = parseInt(val, 10);
  if (!isNaN(num) && num >= 0) {
    state.streak = num;
    saveState();
    renderStats();
  }
});

/* ===================== HOURS LOG =====================
   Entries are keyed by calendar date. Saving a date that already has
   an entry OVERWRITES it in place — it never appends a second row for
   the same day, so totals can't double-count from re-editing a past day. */
function renderHours() {
  const tbody = document.getElementById('hoursTableBody');
  tbody.innerHTML = '';
  const entries = Object.entries(state.hours)
    .sort((a, b) => (b[1].date || '').localeCompare(a[1].date || ''));

  entries.forEach(([key, e]) => {
    const tr = document.createElement('tr');
    const total = (Number(e.gvt) || 0) + (Number(e.ai) || 0);
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
        saveState();
        renderHours();
        renderStats();
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
  // Key by the date itself: saving the same date again replaces the
  // existing entry instead of creating a new one.
  state.hours[dateVal] = { date: dateVal, gvt, ai };
  saveState();
  renderHours();
  renderStats();
  e.target.reset();
});

/* ===================== DELIVERABLES ===================== */
function renderDeliverables() {
  const list = document.getElementById('deliverableList');
  list.innerHTML = '';
  state.deliverables.forEach(item => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';
    li.innerHTML = `
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <span class="delv-text" contenteditable="true">${escapeHtml(item.text)}</span>
      <button class="btn-text danger">Delete</button>
    `;
    const checkbox = li.querySelector('input');
    const textEl = li.querySelector('.delv-text');
    const delBtn = li.querySelector('button');

    checkbox.addEventListener('change', () => {
      item.done = checkbox.checked;
      saveState();
      renderDeliverables();
      renderStats();
    });
    textEl.addEventListener('blur', () => {
      const newText = textEl.textContent.trim();
      if (newText) { item.text = newText; saveState(); }
      else { textEl.textContent = item.text; }
    });
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this deliverable?')) {
        state.deliverables = state.deliverables.filter(d => d.id !== item.id);
        saveState();
        renderDeliverables();
        renderStats();
      }
    });
    list.appendChild(li);
  });
}

document.getElementById('deliverableForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('deliverableText');
  const text = input.value.trim();
  if (!text) return;
  state.deliverables.push({ id: uid('d'), text, done: false });
  saveState();
  renderDeliverables();
  renderStats();
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
    head.innerHTML = `
      <div>
        <h3>${period.label} — ${period.theme}</h3>
        <span class="period-meta">${period.dates}</span>
      </div>
    `;
    head.addEventListener('click', () => card.classList.toggle('open'));

    const body = document.createElement('div');
    body.className = 'period-body';

    const cols = document.createElement('div');
    cols.className = 'period-cols';

    // Planned column
    const plannedCol = document.createElement('div');
    plannedCol.className = 'period-col';
    plannedCol.innerHTML = `<h4>Planned</h4>`;
    period.planned.forEach((itemText, i) => {
      const key = `${period.id}-${i}`;
      const row = document.createElement('div');
      row.className = 'planned-item';
      const status = state.planStatus[key] || 'pending';
      row.innerHTML = `
        <span>${escapeHtml(itemText)}</span>
        <select class="status-select status-${status}">
          <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="on-track" ${status === 'on-track' ? 'selected' : ''}>On track</option>
          <option value="ahead" ${status === 'ahead' ? 'selected' : ''}>Ahead</option>
          <option value="deferred" ${status === 'deferred' ? 'selected' : ''}>Deferred</option>
          <option value="done" ${status === 'done' ? 'selected' : ''}>Done</option>
        </select>
      `;
      const select = row.querySelector('select');
      select.addEventListener('change', () => {
        state.planStatus[key] = select.value;
        select.className = `status-select status-${select.value}`;
        saveState();
      });
      plannedCol.appendChild(row);
    });

    // Actual column
    const actualCol = document.createElement('div');
    actualCol.className = 'period-col';
    actualCol.innerHTML = `
      <h4>Actual / Current Status</h4>
      <textarea class="actual-notes" placeholder="What actually happened this period...">${escapeHtml(state.actualNotes[period.id] || '')}</textarea>
    `;
    const textarea = actualCol.querySelector('textarea');
    textarea.addEventListener('blur', () => {
      state.actualNotes[period.id] = textarea.value;
      saveState();
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

  // Open the period that contains "today" by default
  const currentDay = getSprintDay();
  const dayToPeriod = currentDay <= 7 ? 'w1' : currentDay <= 14 ? 'w2' : currentDay <= 21 ? 'w3' : currentDay <= 28 ? 'w4' : currentDay <= 56 ? 'm2' : 'm3';
  const openCard = container.querySelector(`.period-card[data-id="${dayToPeriod}"]`);
  if (openCard) openCard.classList.add('open');
}

/* ===================== REVENUE TARGETS ===================== */
function renderRevenue() {
  const tbody = document.getElementById('revenueTableBody');
  tbody.innerHTML = '';
  REVENUE_TARGETS.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.month}</td>
      <td>${r.original}</td>
      <td>${r.revised}</td>
      <td>${r.status}</td>
    `;
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
      <td>
        <select class="status-pick">
          <option value="live" ${p.status === 'live' ? 'selected' : ''}>Live</option>
          <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option>
        </select>
      </td>
      <td><button class="btn-text danger">Delete</button></td>
    `;
    tr.querySelector('.edit-name').addEventListener('blur', (e) => {
      p.name = e.target.textContent.trim() || p.name;
      saveState();
    });
    tr.querySelector('.edit-price').addEventListener('blur', (e) => {
      p.price = e.target.textContent.trim();
      saveState();
    });
    tr.querySelector('.status-pick').addEventListener('change', (e) => {
      p.status = e.target.value;
      saveState();
    });
    tr.querySelector('button').addEventListener('click', () => {
      if (confirm(`Delete "${p.name}"?`)) {
        state.products = state.products.filter(x => x.id !== p.id);
        saveState();
        renderProducts();
        renderStats();
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
  saveState();
  renderProducts();
  renderStats();
  e.target.reset();
});

/* ===================== DECISIONS LOG ===================== */
function renderDecisions() {
  const list = document.getElementById('decisionList');
  list.innerHTML = '';
  const sorted = [...state.decisions].sort((a, b) => b.date.localeCompare(a.date));
  sorted.forEach(d => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="decision-date">${formatDisplayDate(d.date)}</span>
      <span class="decision-text" contenteditable="true">${escapeHtml(d.text)}</span>
      <button class="btn-text danger">Delete</button>
    `;
    li.querySelector('.decision-text').addEventListener('blur', (e) => {
      const newText = e.target.textContent.trim();
      if (newText) { d.text = newText; saveState(); }
      else { e.target.textContent = d.text; }
    });
    li.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this decision entry?')) {
        state.decisions = state.decisions.filter(x => x.id !== d.id);
        saveState();
        renderDecisions();
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
  saveState();
  renderDecisions();
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
  const d = parseLocalDate(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ===================== INIT ===================== */
function init() {
  const today = formatLocalDate(todayLocal());
  document.getElementById('hoursDate').value = today;
  document.getElementById('decisionDate').value = today;

  renderDayCounter();
  renderStats();
  renderHours();
  renderDeliverables();
  renderRoadmap();
  renderRevenue();
  renderProducts();
  renderDecisions();
}

init();
