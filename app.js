/* =====================================================================
   GVT Command Center v2 — Day 47–90 operating dashboard
   Data model: single JSON state object. Baseline ships in data.json;
   live state persists to localStorage and (when configured) syncs to a
   Netlify Blobs store via /api/state. No seed/migration dual-write:
   data.json is only read on first boot or explicit import.
   ===================================================================== */

const SPRINT_START = '2026-06-08';
const LS_KEY = 'gvt_cc_v2';
const LS_LEGACY_KEY = 'gvt_command_center_v1'; // read-only; never deleted
const LS_SYNC_KEY = 'gvt_cc_sync_key';

/* ===================== DATE HELPERS =====================
   Always build dates from local Y/M/D parts — parsing "YYYY-MM-DD" with
   new Date(str) reads UTC midnight and can shift the day in some zones. */
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
  return Math.round((todayLocal() - parseLocalDate(SPRINT_START)) / 86400000) + 1;
}
function formatDisplayDate(iso) {
  return parseLocalDate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===================== STATE ===================== */
let state = null;

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  schedulePush();
}

/* ===================== LEGACY IMPORT =====================
   One-time, non-destructive: pulls user-entered data out of the v1
   localStorage blob (hours logged in the UI, custom decisions/extras,
   checked-off plan items) and merges it into the v2 baseline. The v1
   blob is left untouched as a fallback. */
function importLegacy(s) {
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(LS_LEGACY_KEY)); } catch { legacy = null; }
  if (!legacy) return;

  // Hours: v1 entries win for dates the baseline doesn't have
  Object.entries(legacy.hours || {}).forEach(([key, entry]) => {
    if (!s.hours[key]) s.hours[key] = entry;
  });

  // Decisions: append any the baseline doesn't already contain (user-added)
  const knownDecisions = new Set(s.decisions.map(d => d.text));
  (legacy.decisions || []).forEach(d => {
    if (!knownDecisions.has(d.text)) s.decisions.push({ id: uid('k'), date: d.date, text: d.text });
  });

  // Extras: adopt done-state by text match; append unknown items
  const extraByText = new Map(s.additionalDeliverables.map(d => [d.text, d]));
  (legacy.additionalDeliverables || legacy.deliverables || []).forEach(d => {
    const match = extraByText.get(d.text);
    if (match) match.done = d.done;
    else s.additionalDeliverables.push({ id: uid('d'), text: d.text, done: !!d.done });
  });

  // Products: baseline list is canonical (27 per Day 47 correction), but
  // keep anything the user added by hand that we don't know about
  const knownProducts = new Set(s.products.map(p => p.name));
  (legacy.products || []).forEach(p => {
    if (!knownProducts.has(p.name)) s.products.push({ id: uid('p'), name: p.name, price: p.price || '', status: p.status || 'live' });
  });

  // Archive statuses: v1 plan checkboxes upgrade 'open' items to 'done'
  // (never override an explicit done/dropped/carried call in the baseline)
  const items = {};
  s.archive.phases.forEach(ph => ph.items.forEach(it => { items[it.id] = it; }));
  Object.entries(legacy.planItems || {}).forEach(([key, checked]) => {
    if (checked && items[key] && items[key].status === 'open') items[key].status = 'done';
  });
}

/* ===================== SYNC =====================
   Shared truth lives in Netlify Blobs behind /api/state (see
   netlify/functions/state.mjs). The client is local-first: every change
   lands in localStorage immediately, then a debounced push follows.
   Newer updatedAt wins on boot. Honest pill states, no fake "saved". */
const sync = { mode: 'checking', timer: null };

function syncKey() { return localStorage.getItem(LS_SYNC_KEY) || ''; }

function setPill(mode, label, title) {
  sync.mode = mode;
  const pill = document.getElementById('syncPill');
  pill.textContent = label;
  pill.title = title || label;
  pill.className = 'sync-pill ' + (mode === 'synced' ? 'synced' : mode === 'error' ? 'error' : 'local');
}

async function apiCall(method, body) {
  const res = await fetch('/api/state', {
    method,
    headers: { 'x-gvt-key': syncKey(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON = function absent */ }
  return { status: res.status, json };
}

async function initSync() {
  try {
    const { status, json } = await apiCall('GET');
    if (status === 503) { setPill('local', 'Local only', 'Sync server not configured yet (GVT_ACCESS_KEY unset in Netlify)'); return; }
    if (status === 401) { setPill('local', 'Set sync key', 'Server is configured — enter the access key in Settings to sync'); return; }
    if (status !== 200 || !json) { setPill('local', 'No sync', 'Sync endpoint unavailable — running on localStorage'); return; }

    const server = json.state;
    if (server && server.updatedAt > state.updatedAt) {
      state = server;
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      renderAll();
      setPill('synced', 'Synced ✓', 'Pulled newer state from server');
    } else if (!server || state.updatedAt > server.updatedAt) {
      await apiCall('PUT', state);
      setPill('synced', 'Synced ✓', 'Pushed local state to server');
    } else {
      setPill('synced', 'Synced ✓', 'Local and server state match');
    }
  } catch {
    setPill('local', 'Offline', 'Could not reach sync endpoint — changes stay local until next load');
  }
}

function schedulePush() {
  if (sync.mode !== 'synced') return;
  clearTimeout(sync.timer);
  sync.timer = setTimeout(async () => {
    try {
      const { status } = await apiCall('PUT', state);
      if (status !== 200) setPill('error', 'Sync failed', 'Push rejected — check key in Settings');
    } catch {
      setPill('error', 'Sync failed', 'Network error pushing state — will retry on next change');
    }
  }, 1200);
}

/* ===================== RENDER: HEADER + TODAY ===================== */
function renderHeader() {
  const day = getSprintDay();
  document.getElementById('dayNumber').textContent = day;
  document.getElementById('daysLeft').textContent = Math.max(0, 90 - day);
  document.getElementById('dayDate').textContent = todayLocal().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('revenueBig').textContent = '$' + Number(state.revenueToDate || 0).toLocaleString();
}

function nextCheckpoint() {
  return state.checkpoints.filter(c => !c.done).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

function currentBlock() {
  const day = getSprintDay();
  return state.blocks.find(b => day >= b.startDay && day <= b.endDay) || null;
}

function renderToday() {
  const el = document.getElementById('todayStrip');
  const day = getSprintDay();
  const blk = currentBlock();
  const cp = nextCheckpoint();
  let cards = '';

  if (blk) {
    const remaining = blk.items.filter(i => !i.done).length;
    cards += `<div class="today-card"><h3>Now: ${escapeHtml(blk.label)}</h3>
      <p class="big">${remaining === 0 ? 'Block complete ✓' : remaining + ' item' + (remaining > 1 ? 's' : '') + ' remaining'}</p>
      <p>${escapeHtml(blk.dates)}</p></div>`;
  } else if (day >= 57) {
    cards += `<div class="today-card"><h3>Iteration cycle</h3>
      <p class="big">Execute on the last checkpoint's verdicts</p>
      <p>Scale what worked, iterate what's unclear, kill what didn't</p></div>`;
  }

  if (cp) {
    const diff = Math.round((parseLocalDate(cp.date) - todayLocal()) / 86400000);
    const when = diff === 0 ? '<span class="big">TODAY — run it before anything else</span>'
      : diff < 0 ? `<span class="big">Overdue by ${-diff} day${-diff > 1 ? 's' : ''} — run it now</span>`
      : `<span class="big">In ${diff} day${diff > 1 ? 's' : ''}</span>`;
    cards += `<div class="today-card checkpoint-next"><h3>Next checkpoint: ${escapeHtml(cp.label)}</h3>
      <p>${when}</p><p>${formatDisplayDate(cp.date)} · Day ${cp.day}</p></div>`;
  }

  cards += `<div class="today-card freeze"><h3>Catalog frozen</h3>
    <p>No new SKUs until Test Week 1 signal says what to build. Demand first.</p></div>`;

  el.innerHTML = cards;
}

function renderStats() {
  const totals = Object.values(state.hours).reduce((a, e) => {
    a.gvt += Number(e.gvt) || 0; a.ai += Number(e.ai) || 0; return a;
  }, { gvt: 0, ai: 0 });
  document.getElementById('statGvtHours').textContent = totals.gvt.toFixed(2).replace(/\.00$/, '');
  document.getElementById('statAiHours').textContent = totals.ai.toFixed(2).replace(/\.00$/, '');
  document.getElementById('statProducts').textContent = state.products.filter(p => p.status === 'live').length;
  const done = state.checkpoints.filter(c => c.done).length;
  document.getElementById('statCheckpoints').textContent = `${done}/${state.checkpoints.length}`;
}

/* ===================== RENDER: BLOCKS ===================== */
function renderBlocks() {
  const container = document.getElementById('blockList');
  container.innerHTML = '';
  const day = getSprintDay();

  state.blocks.forEach(blk => {
    const doneCount = blk.items.filter(i => i.done).length;
    const isCurrent = day >= blk.startDay && day <= blk.endDay;
    const isPast = day > blk.endDay;
    const card = document.createElement('div');
    card.className = 'block-card' + (isCurrent ? ' current' : isPast ? ' past' : '');
    card.innerHTML = `
      <div class="block-head">
        <div>
          <span class="block-title">${escapeHtml(blk.label)}</span>
          ${isCurrent ? '<span class="now-chip">Now</span>' : ''}
          <div class="block-dates">${escapeHtml(blk.dates)}</div>
        </div>
        <span class="block-count${doneCount === blk.items.length ? ' complete' : ''}">${doneCount}/${blk.items.length}</span>
      </div>
      <ul class="block-items"></ul>`;
    const ul = card.querySelector('ul');
    blk.items.forEach(item => {
      const li = document.createElement('li');
      li.className = item.done ? 'done' : '';
      li.innerHTML = `<input type="checkbox" ${item.done ? 'checked' : ''}><span>${escapeHtml(item.text)}</span>`;
      li.querySelector('input').addEventListener('change', (e) => {
        item.done = e.target.checked;
        saveState();
        renderBlocks();
        renderToday();
      });
      ul.appendChild(li);
    });
    container.appendChild(card);
  });

  const note = document.createElement('div');
  note.className = 'iteration-note';
  note.innerHTML = '<strong>Day 57–90:</strong> weekly iteration cycles. Each Monday checkpoint below decides what the following week is spent on — scale, iterate, or kill per channel. Catalog expansion unfreezes only when demand data justifies specific SKUs.';
  container.appendChild(note);
}

/* ===================== RENDER: CHECKPOINTS ===================== */
function renderCheckpoints() {
  document.getElementById('rulesList').innerHTML =
    state.rules.map(r => `<li>${escapeHtml(r)}</li>`).join('');

  const container = document.getElementById('checkpointList');
  container.innerHTML = '';
  const today = formatLocalDate(todayLocal());

  state.checkpoints.forEach(cp => {
    const isDue = !cp.done && cp.date <= today;
    const card = document.createElement('div');
    card.className = 'cp-card' + (isDue ? ' due open' : '') + (cp.done ? ' done-cp' : '');
    card.innerHTML = `
      <div class="cp-head">
        <div>
          <span class="cp-title">${escapeHtml(cp.label)}</span>
          <div class="cp-meta">${formatDisplayDate(cp.date)} · Day ${cp.day}</div>
        </div>
        <span class="cp-status ${cp.done ? 'done' : isDue ? 'due' : ''}">${cp.done ? 'Done ✓' : isDue ? 'Due' : 'Upcoming'}</span>
      </div>
      <div class="cp-body">
        <div class="table-wrap">
          <table class="cp-table">
            <thead><tr><th>Channel</th><th>Spend $</th><th>Clicks</th><th>Sessions</th><th>Conv.</th><th>Rev $</th><th>Verdict</th><th>Notes</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <textarea class="cp-summary" placeholder="Checkpoint summary — what was decided and why...">${escapeHtml(cp.summary || '')}</textarea>
        <div class="cp-actions">
          <button class="btn-text add-row" type="button">+ Add channel row</button>
          <button class="btn-primary complete-btn" type="button">${cp.done ? 'Reopen checkpoint' : 'Mark checkpoint complete'}</button>
        </div>
      </div>`;

    card.querySelector('.cp-head').addEventListener('click', () => card.classList.toggle('open'));

    const tbody = card.querySelector('tbody');
    cp.channels.forEach(row => {
      const tr = document.createElement('tr');
      const num = (field, width) => `<td style="width:${width}"><input type="number" min="0" step="any" data-f="${field}" value="${escapeHtml(row[field])}"></td>`;
      tr.innerHTML = `
        <td class="ch-name">${escapeHtml(row.name)}</td>
        ${num('spend', '70px')}${num('clicks', '64px')}${num('sessions', '64px')}${num('conversions', '58px')}${num('revenue', '70px')}
        <td style="width:92px">
          <select data-f="verdict" class="verdict-${row.verdict}">
            <option value="pending" ${row.verdict === 'pending' ? 'selected' : ''}>—</option>
            <option value="scale" ${row.verdict === 'scale' ? 'selected' : ''}>Scale</option>
            <option value="iterate" ${row.verdict === 'iterate' ? 'selected' : ''}>Iterate</option>
            <option value="kill" ${row.verdict === 'kill' ? 'selected' : ''}>Kill</option>
          </select>
        </td>
        <td style="min-width:140px"><input type="text" data-f="notes" value="${escapeHtml(row.notes)}"></td>`;
      tr.querySelectorAll('[data-f]').forEach(input => {
        input.addEventListener('change', () => {
          row[input.dataset.f] = input.value;
          if (input.dataset.f === 'verdict') input.className = `verdict-${input.value}`;
          saveState();
        });
      });
      tbody.appendChild(tr);
    });

    card.querySelector('.cp-summary').addEventListener('blur', (e) => {
      cp.summary = e.target.value;
      saveState();
    });
    card.querySelector('.add-row').addEventListener('click', () => {
      const name = prompt('Channel name for this row:');
      if (!name || !name.trim()) return;
      cp.channels.push({ id: uid('r'), name: name.trim(), spend: '', clicks: '', sessions: '', conversions: '', revenue: '', verdict: 'pending', notes: '' });
      saveState();
      renderCheckpoints();
    });
    card.querySelector('.complete-btn').addEventListener('click', () => {
      cp.done = !cp.done;
      saveState();
      renderCheckpoints();
      renderToday();
      renderStats();
    });

    container.appendChild(card);
  });
}

/* ===================== RENDER: CHANNELS + UTM ===================== */
function renderChannels() {
  const grid = document.getElementById('channelList');
  grid.innerHTML = '';
  state.channels.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'channel-card' + (ch.status === 'repurposed' ? ' repurposed' : '');
    card.innerHTML = `
      <div class="channel-name">${escapeHtml(ch.name)}<span class="ch-status ${ch.status}">${escapeHtml(ch.status)}</span></div>
      <p class="channel-role">${escapeHtml(ch.role)}</p>
      ${ch.utmSource ? `<span class="channel-utm">utm_source=${escapeHtml(ch.utmSource)} · utm_medium=${escapeHtml(ch.utmMedium)}</span>` : '<span class="channel-utm">no outbound links from this account</span>'}`;
    grid.appendChild(card);
  });

  const select = document.getElementById('utmChannel');
  select.innerHTML = state.channels
    .filter(ch => ch.utmSource)
    .map(ch => `<option value="${ch.id}">${escapeHtml(ch.name)}</option>`)
    .join('');
}

function buildUtm() {
  const chId = document.getElementById('utmChannel').value;
  const ch = state.channels.find(c => c.id === chId);
  const campaign = document.getElementById('utmCampaign').value.trim();
  const content = document.getElementById('utmContent').value.trim();
  let path = document.getElementById('utmPath').value.trim() || '/';
  if (!path.startsWith('/')) path = '/' + path;
  const out = document.getElementById('utmResult');
  if (!ch || !campaign) { out.textContent = 'Pick a channel and enter a campaign slug…'; return; }
  const base = (state.settings.baseUrl || '').replace(/\/$/, '');
  const params = new URLSearchParams({ utm_source: ch.utmSource, utm_medium: ch.utmMedium, utm_campaign: campaign });
  if (content) params.set('utm_content', content);
  out.textContent = `${base}${path}?${params.toString()}`;
}

/* ===================== RENDER: SIMPLE PANELS ===================== */
function renderRevenue() {
  document.getElementById('revenueTableBody').innerHTML = state.revenueTargets
    .map(r => `<tr><td>${escapeHtml(r.month)}</td><td>${escapeHtml(r.original)}</td><td>${escapeHtml(r.revised)}</td><td>${escapeHtml(r.status)}</td></tr>`)
    .join('');
}

function renderHours() {
  const tbody = document.getElementById('hoursTableBody');
  tbody.innerHTML = '';
  Object.entries(state.hours)
    .sort((a, b) => (b[1].date || '').localeCompare(a[1].date || ''))
    .forEach(([key, e]) => {
      const total = (Number(e.gvt) || 0) + (Number(e.ai) || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(e.label || e.date)}</td><td>${e.gvt}</td><td>${e.ai}</td><td>${total}</td>
        <td><button class="btn-text danger">Delete</button></td>`;
      tr.querySelector('button').addEventListener('click', () => {
        if (confirm('Delete this hours entry?')) {
          delete state.hours[key];
          saveState(); renderHours(); renderStats();
        }
      });
      tbody.appendChild(tr);
    });
}

function renderDecisions() {
  const list = document.getElementById('decisionList');
  list.innerHTML = '';
  [...state.decisions].sort((a, b) => b.date.localeCompare(a.date)).forEach(d => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="decision-date">${formatDisplayDate(d.date)}</span>
      <span class="decision-text" contenteditable="true">${escapeHtml(d.text)}</span>
      <button class="btn-text danger">Delete</button>`;
    li.querySelector('.decision-text').addEventListener('blur', (e) => {
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

function renderProducts() {
  const tbody = document.getElementById('productTableBody');
  tbody.innerHTML = '';
  document.getElementById('catalogCountBadge').textContent = state.products.length;
  state.products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td contenteditable="true" class="edit-name">${escapeHtml(p.name)}</td>
      <td contenteditable="true" class="edit-price">${escapeHtml(p.price || '')}</td>
      <td><select>
        <option value="live" ${p.status === 'live' ? 'selected' : ''}>Live</option>
        <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option>
      </select></td>
      <td><button class="btn-text danger">Delete</button></td>`;
    tr.querySelector('.edit-name').addEventListener('blur', e => { p.name = e.target.textContent.trim() || p.name; saveState(); });
    tr.querySelector('.edit-price').addEventListener('blur', e => { p.price = e.target.textContent.trim(); saveState(); });
    tr.querySelector('select').addEventListener('change', e => { p.status = e.target.value; saveState(); renderStats(); });
    tr.querySelector('button').addEventListener('click', () => {
      if (confirm(`Delete "${p.name}"?`)) {
        state.products = state.products.filter(x => x.id !== p.id);
        saveState(); renderProducts(); renderStats();
      }
    });
    tbody.appendChild(tr);
  });
}

function renderExtras() {
  const list = document.getElementById('extrasList');
  list.innerHTML = '';
  state.additionalDeliverables.forEach(item => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';
    li.innerHTML = `
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <span class="delv-text" contenteditable="true">${escapeHtml(item.text)}</span>
      <button class="btn-text danger">Delete</button>`;
    li.querySelector('input').addEventListener('change', (e) => {
      item.done = e.target.checked;
      saveState(); renderExtras();
    });
    li.querySelector('.delv-text').addEventListener('blur', (e) => {
      const t = e.target.textContent.trim();
      if (t) { item.text = t; saveState(); } else { e.target.textContent = item.text; }
    });
    li.querySelector('button').addEventListener('click', () => {
      if (confirm('Delete this item?')) {
        state.additionalDeliverables = state.additionalDeliverables.filter(d => d.id !== item.id);
        saveState(); renderExtras();
      }
    });
    list.appendChild(li);
  });
}

/* ===================== RENDER: ARCHIVE ===================== */
function renderArchive() {
  document.getElementById('archiveAssessment').textContent = state.archive.assessment;

  const phases = document.getElementById('archivePhases');
  phases.innerHTML = '';
  state.archive.phases.forEach(ph => {
    const doneCount = ph.items.filter(i => i.status === 'done').length;
    const wrap = document.createElement('div');
    wrap.className = 'archive-phase';
    wrap.innerHTML = `
      <div class="archive-phase-head"><span>${escapeHtml(ph.label)} — ${escapeHtml(ph.theme)}</span><span>${doneCount}/${ph.items.length} done</span></div>
      <ul class="archive-items"></ul>`;
    const ul = wrap.querySelector('ul');
    ph.items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="st-chip st-${it.status}">${it.status}</span>
        <span>${escapeHtml(it.text)}${it.note ? ` <span class="archive-note">— ${escapeHtml(it.note)}</span>` : ''}</span>`;
      ul.appendChild(li);
    });
    phases.appendChild(wrap);
  });

  const roadmap = document.getElementById('archiveRoadmap');
  roadmap.innerHTML = state.archive.roadmap.map(r => `
    <div class="roadmap-row">
      <h4>${escapeHtml(r.label)} — ${escapeHtml(r.theme)} <span class="archive-note">(${escapeHtml(r.dates)})</span></h4>
      <p><span class="lbl">Planned:</span> ${escapeHtml(r.target)}</p>
      <p><span class="lbl">Actual:</span> ${escapeHtml(r.actual)}</p>
    </div>`).join('');
}

/* ===================== RENDER ALL ===================== */
function renderAll() {
  renderHeader();
  renderToday();
  renderStats();
  renderBlocks();
  renderCheckpoints();
  renderChannels();
  buildUtm();
  renderRevenue();
  renderHours();
  renderDecisions();
  renderProducts();
  renderExtras();
  renderArchive();
}

/* ===================== STATIC EVENT BINDINGS ===================== */
function bindForms() {
  document.getElementById('hoursForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const dateVal = document.getElementById('hoursDate').value;
    if (!dateVal) return;
    // Keyed by date: re-saving a date replaces the entry, never duplicates
    state.hours[dateVal] = {
      date: dateVal,
      gvt: parseFloat(document.getElementById('hoursGvt').value) || 0,
      ai: parseFloat(document.getElementById('hoursAi').value) || 0
    };
    saveState(); renderHours(); renderStats();
    e.target.reset();
    document.getElementById('hoursDate').value = formatLocalDate(todayLocal());
  });

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

  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    if (!name) return;
    state.products.push({
      id: uid('p'), name,
      price: document.getElementById('productPrice').value.trim(),
      status: document.getElementById('productStatus').value
    });
    saveState(); renderProducts(); renderStats();
    e.target.reset();
  });

  document.getElementById('extraForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('extraText').value.trim();
    if (!text) return;
    state.additionalDeliverables.push({ id: uid('d'), text, done: false });
    saveState(); renderExtras();
    e.target.reset();
  });

  ['utmChannel', 'utmCampaign', 'utmContent', 'utmPath'].forEach(id => {
    document.getElementById(id).addEventListener('input', buildUtm);
    document.getElementById(id).addEventListener('change', buildUtm);
  });
  document.getElementById('utmCopy').addEventListener('click', async () => {
    const text = document.getElementById('utmResult').textContent;
    if (!text.startsWith('http')) return;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById('utmCopy').textContent = 'Copied ✓';
      setTimeout(() => { document.getElementById('utmCopy').textContent = 'Copy'; }, 1500);
    } catch { prompt('Copy the link:', text); }
  });

  document.getElementById('revBlock').addEventListener('click', () => {
    const val = prompt('Revenue to date (from Shopify actuals), number only:', state.revenueToDate);
    if (val === null) return;
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) { state.revenueToDate = num; saveState(); renderHeader(); }
  });

  // Settings modal
  const modal = document.getElementById('settingsModal');
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('syncKeyInput').value = syncKey();
    document.getElementById('baseUrlInput').value = state.settings.baseUrl || '';
    modal.hidden = false;
  });
  document.getElementById('syncPill').addEventListener('click', () => {
    if (sync.mode !== 'synced') document.getElementById('settingsBtn').click();
  });
  document.getElementById('settingsClose').addEventListener('click', () => { modal.hidden = true; });
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    localStorage.setItem(LS_SYNC_KEY, document.getElementById('syncKeyInput').value.trim());
    const base = document.getElementById('baseUrlInput').value.trim();
    if (base) state.settings.baseUrl = base;
    saveState(); buildUtm();
    modal.hidden = true;
    initSync();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gvt-cc-backup-${formatLocalDate(todayLocal())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (imported.schema !== 2) { alert('Not a valid GVT CC v2 backup file.'); return; }
        if (!confirm('Replace ALL current data with this backup?')) return;
        state = imported;
        saveState(); renderAll();
      } catch { alert('Could not read that file as JSON.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

/* ===================== BOOT ===================== */
(async function boot() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try { state = JSON.parse(raw); } catch { state = null; }
  }
  if (!state) {
    const res = await fetch('data.json');
    if (!res.ok) {
      document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Could not load data.json — check the deploy.</p>';
      return;
    }
    state = await res.json();
    importLegacy(state);
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  const today = formatLocalDate(todayLocal());
  document.getElementById('hoursDate').value = today;
  document.getElementById('decisionDate').value = today;

  bindForms();
  renderAll();
  initSync();
})();
