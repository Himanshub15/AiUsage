/* ═══════════════════════════════════════════
   AiUsage v2.0 — Script
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "aiUsage.v2";
const THEME_KEY = "aiUsage.theme";

/* ── Provider definitions ── */
const PROVIDERS = {
  claude:    { name: "Claude",          color: "#d97706", category: "chat",  domain: "anthropic.com",       plan: "Pro",   sessionLimit: 100, weeklyLimit: 500 },
  openai:    { name: "OpenAI",          color: "#10a37f", category: "chat",  domain: "openai.com",          plan: "Plus",  sessionLimit: 80,  weeklyLimit: 400 },
  gemini:    { name: "Gemini",          color: "#4285f4", category: "chat",  domain: "gemini.google.com",   plan: "Free",  sessionLimit: 50,  weeklyLimit: 300 },
  cursor:    { name: "Cursor",          color: "#7c3aed", category: "ide",   domain: "cursor.com",          plan: "Pro",   sessionLimit: 500, weeklyLimit: 2500 },
  copilot:   { name: "GitHub Copilot",  color: "#6e40c9", category: "ide",   domain: "github.com",          plan: "Business", sessionLimit: 300, weeklyLimit: 1500 },
  codex:     { name: "Codex CLI",       color: "#0ea5e9", category: "ide",   domain: "openai.com",          plan: "Free",  sessionLimit: 200, weeklyLimit: 1000 },
  zai:       { name: "z.ai",            color: "#ec4899", category: "chat",  domain: "z.ai",                plan: "Free",  sessionLimit: 40,  weeklyLimit: 200 },
  kimi:      { name: "Kimi",            color: "#f43f5e", category: "chat",  domain: "kimi.moonshot.cn",    plan: "Free",  sessionLimit: 60,  weeklyLimit: 300 },
  kiro:      { name: "Kiro",            color: "#f97316", category: "ide",   domain: "kiro.dev",            plan: "Free",  sessionLimit: 100, weeklyLimit: 500 },
  jetbrains: { name: "JetBrains AI",    color: "#fe315d", category: "ide",   domain: "jetbrains.com",       plan: "Pro",   sessionLimit: 200, weeklyLimit: 1000 },
  augment:   { name: "Augment",         color: "#06b6d4", category: "ide",   domain: "augmentcode.com",     plan: "Free",  sessionLimit: 150, weeklyLimit: 750 },
  amp:       { name: "Amp",             color: "#8b5cf6", category: "ide",   domain: "amp.dev",             plan: "Free",  sessionLimit: 100, weeklyLimit: 500 },
  warp:      { name: "Warp",            color: "#22d3ee", category: "ide",   domain: "warp.dev",            plan: "Free",  sessionLimit: 80,  weeklyLimit: 400 },
  ollama:    { name: "Ollama",          color: "#a3a3a3", category: "other", domain: "ollama.com",          plan: "Local", sessionLimit: 999, weeklyLimit: 9999 },
  perplexity:{ name: "Perplexity",      color: "#22c55e", category: "chat",  domain: "perplexity.ai",       plan: "Free",  sessionLimit: 30,  weeklyLimit: 150 },
  mistral:   { name: "Mistral",         color: "#f97316", category: "chat",  domain: "mistral.ai",          plan: "Free",  sessionLimit: 40,  weeklyLimit: 200 },
  deepseek:  { name: "DeepSeek",        color: "#3b82f6", category: "chat",  domain: "deepseek.com",        plan: "Free",  sessionLimit: 50,  weeklyLimit: 250 },
  metaai:    { name: "Meta AI",         color: "#0ea5e9", category: "chat",  domain: "meta.ai",             plan: "Free",  sessionLimit: 60,  weeklyLimit: 300 },
  poe:       { name: "Poe",             color: "#a855f7", category: "chat",  domain: "poe.com",             plan: "Free",  sessionLimit: 30,  weeklyLimit: 150 },
  runway:    { name: "Runway",          color: "#e11d48", category: "media", domain: "runwayml.com",        plan: "Free",  sessionLimit: 10,  weeklyLimit: 50 },
  notionai:  { name: "Notion AI",       color: "#f5f5f5", category: "other", domain: "notion.so",           plan: "Plus",  sessionLimit: 100, weeklyLimit: 500 },
  openrouter:{ name: "OpenRouter",      color: "#6366f1", category: "other", domain: "openrouter.ai",       plan: "Free",  sessionLimit: 200, weeklyLimit: 1000 },
  xai:       { name: "xAI / Grok",      color: "#f5f5f5", category: "chat",  domain: "x.ai",               plan: "Premium", sessionLimit: 80, weeklyLimit: 400 },
  windsurf:  { name: "Windsurf",        color: "#14b8a6", category: "ide",   domain: "windsurf.com",        plan: "Pro",   sessionLimit: 300, weeklyLimit: 1500 },
};

/* ── State ── */
const state = {
  providers: {},
  entries: [],
  settings: { displayMode: "percent", refreshInterval: 5, theme: "dark", providerOrder: Object.keys(PROVIDERS) },
  usageDays: {},
  calendarYear: new Date().getFullYear(),
  dashChartRange: 30,
  analyticsPeriod: "daily",
  providerFilter: "all",
};

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", init);

function init() {
  loadState();
  seedDemoDataIfEmpty();
  applyTheme();
  populateEntryProviderSelect();
  bindEvents();
  renderAll();
  startCountdowns();
}

/* ══════════════ DATA / PERSISTENCE ══════════════ */

function defaultProviderState(key) {
  const def = PROVIDERS[key];
  const now = new Date();
  const sessionReset = new Date(now); sessionReset.setHours(sessionReset.getHours() + 4);
  const weeklyReset = new Date(now); weeklyReset.setDate(weeklyReset.getDate() + (7 - weeklyReset.getDay()));
  weeklyReset.setHours(0, 0, 0, 0);
  return {
    enabled: false,
    apiKey: "",
    plan: def.plan,
    session: { used: 0, limit: def.sessionLimit, resetAt: sessionReset.toISOString() },
    weekly: { used: 0, limit: def.weeklyLimit, resetAt: weeklyReset.toISOString() },
    costs: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.providers) state.providers = d.providers;
      if (Array.isArray(d.entries)) state.entries = d.entries;
      if (d.settings) state.settings = { ...state.settings, ...d.settings };
      if (d.usageDays) state.usageDays = d.usageDays;
    }
  } catch { /* ignore */ }

  // ensure every provider exists in state
  for (const key of Object.keys(PROVIDERS)) {
    if (!state.providers[key]) state.providers[key] = defaultProviderState(key);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    providers: state.providers,
    entries: state.entries,
    settings: state.settings,
    usageDays: state.usageDays,
  }));
}

function seedDemoDataIfEmpty() {
  if (state.entries.length > 0) return;

  const demoProviders = ["claude", "openai", "gemini", "cursor", "copilot"];
  const models = { claude: "Opus 4", openai: "GPT-4o", gemini: "2.5 Pro", cursor: "Claude Sonnet", copilot: "GPT-4o" };
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const numEntries = Math.floor(Math.random() * 3) + 1;
    let dayTokens = 0, dayCost = 0;

    for (let j = 0; j < numEntries; j++) {
      const prov = demoProviders[Math.floor(Math.random() * demoProviders.length)];
      const tokens = Math.floor(Math.random() * 50000) + 5000;
      const cost = parseFloat((tokens * 0.00003 + Math.random() * 0.5).toFixed(2));
      const prompts = Math.floor(Math.random() * 30) + 5;
      dayTokens += tokens;
      dayCost += cost;

      state.entries.push({
        id: crypto.randomUUID(),
        provider: prov,
        model: models[prov] || "",
        tokens,
        cost,
        prompts,
        minutes: Math.floor(Math.random() * 60) + 5,
        date: key,
      });
    }

    state.usageDays[key] = { totalTokens: dayTokens, totalCost: parseFloat(dayCost.toFixed(2)), providers: [...new Set(state.entries.filter(e => e.date === key).map(e => e.provider))] };
  }

  // Enable some providers and set quota usage
  for (const p of demoProviders) {
    state.providers[p].enabled = true;
    state.providers[p].session.used = Math.floor(Math.random() * state.providers[p].session.limit * 0.9);
    state.providers[p].weekly.used = Math.floor(Math.random() * state.providers[p].weekly.limit * 0.7);
    // build cost history
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      state.providers[p].costs.push({ date: dateKey(d), amount: parseFloat((Math.random() * 3 + 0.2).toFixed(2)), tokens: Math.floor(Math.random() * 40000) + 5000 });
    }
  }

  persist();
}

/* ══════════════ EVENTS ══════════════ */

function bindEvents() {
  // Navigation
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
  });

  // Mobile menu
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  menuToggle.addEventListener("click", () => { sidebar.classList.toggle("open"); overlay.classList.toggle("show"); });
  overlay.addEventListener("click", () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); });

  // Theme
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("mobileTheme").addEventListener("click", toggleTheme);

  // Dashboard
  document.getElementById("addEntryBtn").addEventListener("click", openEntryModal);
  document.getElementById("viewAllEntries").addEventListener("click", () => navigateTo("analytics"));
  document.querySelectorAll(".range-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".range-btn").forEach(b => b.classList.toggle("active", b === btn));
      state.dashChartRange = parseInt(btn.dataset.range);
      renderDashCostChart();
    });
  });

  // Provider filters
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
      state.providerFilter = btn.dataset.filter;
      renderProviders();
    });
  });

  // Analytics period
  document.querySelectorAll(".period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach(b => b.classList.toggle("active", b === btn));
      state.analyticsPeriod = btn.dataset.period;
      renderAnalytics();
    });
  });

  // Calendar nav
  document.getElementById("calPrev").addEventListener("click", () => { state.calendarYear--; renderCalendar(); });
  document.getElementById("calNext").addEventListener("click", () => { state.calendarYear++; renderCalendar(); });

  // Entry modal
  document.getElementById("modalClose").addEventListener("click", closeEntryModal);
  document.getElementById("addEntryModal").addEventListener("click", e => { if (e.target === e.currentTarget) closeEntryModal(); });
  document.getElementById("entryForm").addEventListener("submit", handleEntrySubmit);

  // Provider detail modal
  document.getElementById("providerDetailClose").addEventListener("click", closeProviderDetail);
  document.getElementById("providerDetailModal").addEventListener("click", e => { if (e.target === e.currentTarget) closeProviderDetail(); });

  // Settings
  document.getElementById("settingDisplayMode").addEventListener("change", e => { state.settings.displayMode = e.target.value; persist(); renderAll(); });
  document.getElementById("settingTheme").addEventListener("change", e => { state.settings.theme = e.target.value; applyTheme(); persist(); });
  document.getElementById("settingRefresh").addEventListener("change", e => { state.settings.refreshInterval = parseInt(e.target.value); persist(); });
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importInput").addEventListener("change", importData);
  document.getElementById("resetBtn").addEventListener("click", resetData);
}

/* ══════════════ NAVIGATION ══════════════ */

function navigateTo(page) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.dataset.page === page));
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");

  // lazy render
  if (page === "providers") renderProviders();
  if (page === "analytics") renderAnalytics();
  if (page === "calendar") renderCalendar();
  if (page === "settings") syncSettings();
}

/* ══════════════ THEME ══════════════ */

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  state.settings.theme = isLight ? "light" : "dark";
  document.getElementById("themeLabel").textContent = isLight ? "Light" : "Dark";
  document.getElementById("settingTheme").value = state.settings.theme;
  localStorage.setItem(THEME_KEY, state.settings.theme);
  persist();
}

function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY) || state.settings.theme;
  if (saved === "light") document.body.classList.add("light");
  else document.body.classList.remove("light");
  document.getElementById("themeLabel").textContent = saved === "light" ? "Light" : "Dark";
}

/* ══════════════ RENDER ALL ══════════════ */

function renderAll() {
  renderKPIs();
  renderDashProviders();
  renderDashCostChart();
  renderRecentEntries();
}

/* ══════════════ KPI CARDS ══════════════ */

function renderKPIs() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthEntries = state.entries.filter(e => e.date && e.date.startsWith(monthKey));

  const totalCost = monthEntries.reduce((s, e) => s + (e.cost || 0), 0);
  const totalTokens = monthEntries.reduce((s, e) => s + (e.tokens || 0), 0);
  const activeProviders = Object.values(state.providers).filter(p => p.enabled).length;
  const todayKey = dateKey(new Date());
  const todayEntries = state.entries.filter(e => e.date === todayKey);
  const todayPrompts = todayEntries.reduce((s, e) => s + (e.prompts || 0), 0);

  document.getElementById("kpiCost").textContent = `$${totalCost.toFixed(2)}`;
  document.getElementById("kpiTokens").textContent = formatNumber(totalTokens);
  document.getElementById("kpiProviders").textContent = String(activeProviders);
  document.getElementById("kpiProvidersSub").textContent = `of ${Object.keys(PROVIDERS).length} available`;
  document.getElementById("kpiSessions").textContent = String(todayPrompts);
  document.getElementById("kpiSessionsSub").textContent = `${todayEntries.length} entries today`;

  // Token badge
  document.getElementById("kpiTokenBadge").textContent = formatNumber(totalTokens);

  // Sparklines
  renderSparkline("kpiCostSpark", getLast7DayCosts(), "var(--accent)");
  renderSparkline("kpiTokenSpark", getLast7DayTokens(), "var(--blue)");
}

function getLast7DayCosts() {
  const vals = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = dateKey(d);
    vals.push(state.entries.filter(e => e.date === key).reduce((s, e) => s + (e.cost || 0), 0));
  }
  return vals;
}

function getLast7DayTokens() {
  const vals = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = dateKey(d);
    vals.push(state.entries.filter(e => e.date === key).reduce((s, e) => s + (e.tokens || 0), 0));
  }
  return vals;
}

function renderSparkline(containerId, data, color) {
  const el = document.getElementById(containerId);
  if (!el || !data.length) return;
  const w = 120, h = 28, p = 2;
  const max = Math.max(1, ...data);
  const points = data.map((v, i) => {
    const x = p + (i / (data.length - 1 || 1)) * (w - p * 2);
    const y = h - p - (v / max) * (h - p * 2);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `${p},${h - p} ${points} ${w - p},${h - p}`;

  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
    <polygon points="${areaPoints}" fill="${color}" opacity="0.1"/>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* ══════════════ DASHBOARD PROVIDER STATUS ══════════════ */

function renderDashProviders() {
  const grid = document.getElementById("dashProviderGrid");
  const enabled = Object.entries(state.providers).filter(([, v]) => v.enabled);

  document.getElementById("dashProviderCount").textContent = `${enabled.length} active`;

  if (!enabled.length) {
    grid.innerHTML = '<p class="empty-state">No providers enabled. Go to Providers to enable some.</p>';
    return;
  }

  grid.innerHTML = enabled.map(([key, prov]) => {
    const def = PROVIDERS[key];
    const sPct = Math.min(100, Math.round((prov.session.used / prov.session.limit) * 100));
    const wPct = Math.min(100, Math.round((prov.weekly.used / prov.weekly.limit) * 100));
    const sFillClass = sPct > 90 ? "quota-fill--danger" : sPct > 70 ? "quota-fill--warn" : "quota-fill--session";
    const wFillClass = wPct > 90 ? "quota-fill--danger" : wPct > 70 ? "quota-fill--warn" : "quota-fill--weekly";
    const monthlyCost = prov.costs.reduce((s, c) => s + c.amount, 0);

    return `<div class="prov-status" data-provider="${key}">
      <div class="prov-icon" style="background:${def.color}15;color:${def.color};border-color:${def.color}30">
        <img src="https://www.google.com/s2/favicons?domain=${def.domain}&sz=64" width="18" height="18" alt="" style="border-radius:3px"/>
      </div>
      <div class="prov-info">
        <div class="prov-name">${esc(def.name)}</div>
        <div class="prov-quota">
          <div class="quota-bar"><div class="quota-fill ${sFillClass}" style="width:${sPct}%"></div></div>
          <span class="quota-pct">${sPct}%</span>
        </div>
        <div class="prov-quota">
          <div class="quota-bar"><div class="quota-fill ${wFillClass}" style="width:${wPct}%"></div></div>
          <span class="quota-pct">${wPct}%</span>
        </div>
      </div>
      <div class="prov-cost">$${monthlyCost.toFixed(2)}</div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".prov-status").forEach(el => {
    el.addEventListener("click", () => openProviderDetail(el.dataset.provider));
  });
}

/* ══════════════ DASHBOARD COST CHART ══════════════ */

function renderDashCostChart() {
  const container = document.getElementById("dashCostChart");
  const days = state.dashChartRange;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const cost = state.entries.filter(e => e.date === key).reduce((s, e) => s + (e.cost || 0), 0);
    data.push({ label: d.getDate(), value: cost, key });
  }

  renderAreaChart(container, data, { color: "0, 229, 160", height: 200, showLabels: true, prefix: "$" });
}

function renderAreaChart(container, data, opts = {}) {
  const w = 800, h = opts.height || 200, p = 28;
  const max = Math.max(0.01, ...data.map(d => d.value));
  const color = opts.color || "0, 229, 160";
  const prefix = opts.prefix || "";

  const coords = data.map((d, i) => {
    const x = p + (i / (data.length - 1 || 1)) * (w - p * 2);
    const y = h - p - (d.value / max) * (h - p * 2);
    return { x, y, ...d };
  });

  const line = coords.map(c => `${c.x},${c.y}`).join(" ");
  const area = `${coords[0].x},${h - p} ${line} ${coords[coords.length - 1].x},${h - p}`;

  // Grid lines
  const gridLines = [0.25, 0.5, 0.75].map(pct => {
    const y = h - p - pct * (h - p * 2);
    const val = (max * pct).toFixed(prefix === "$" ? 2 : 0);
    return `<line x1="${p}" y1="${y}" x2="${w - p}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <text x="${p - 4}" y="${y + 3}" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="rgba(255,255,255,0.2)">${prefix}${val}</text>`;
  }).join("");

  const labels = coords.filter((_, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0 || i === data.length - 1)
    .map(c => `<text x="${c.x}" y="${h - 6}" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="rgba(255,255,255,0.25)">${c.label}</text>`)
    .join("");

  const dots = coords.map(c =>
    `<circle cx="${c.x}" cy="${c.y}" r="2.5" fill="rgba(${color},0.9)" stroke="rgba(${color},0.3)" stroke-width="2"/>`
  ).join("");

  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" style="display:block">
    ${gridLines}
    <polygon points="${area}" fill="url(#areaGrad${container.id})" />
    <defs><linearGradient id="areaGrad${container.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(${color},0.25)"/>
      <stop offset="100%" stop-color="rgba(${color},0)"/>
    </linearGradient></defs>
    <polyline points="${line}" fill="none" stroke="rgba(${color},0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
    ${opts.showLabels ? labels : ""}
  </svg>`;
}

/* ══════════════ RECENT ENTRIES ══════════════ */

function renderRecentEntries() {
  const container = document.getElementById("dashRecentEntries");
  const recent = [...state.entries].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);

  if (!recent.length) {
    container.innerHTML = '<p class="empty-state">No entries yet. Click "Log Usage" to start tracking.</p>';
    return;
  }

  container.innerHTML = recent.map(e => {
    const def = PROVIDERS[e.provider] || {};
    return `<div class="entry-item">
      <span class="entry-provider"><span class="entry-dot" style="background:${def.color || '#666'}"></span>${esc(def.name || e.provider)}</span>
      <span class="entry-model">${esc(e.model || "—")}</span>
      <span class="entry-tokens">${formatNumber(e.tokens || 0)} tok</span>
      <span class="entry-cost">$${(e.cost || 0).toFixed(2)}</span>
      <span class="entry-date">${e.date || "—"}</span>
      <button class="entry-remove" data-id="${e.id}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
  }).join("");

  container.querySelectorAll(".entry-remove").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      removeEntry(btn.dataset.id);
    });
  });
}

function removeEntry(id) {
  state.entries = state.entries.filter(e => e.id !== id);
  rebuildUsageDays();
  persist();
  renderAll();
}

function rebuildUsageDays() {
  state.usageDays = {};
  for (const e of state.entries) {
    if (!e.date) continue;
    if (!state.usageDays[e.date]) state.usageDays[e.date] = { totalTokens: 0, totalCost: 0, providers: [] };
    state.usageDays[e.date].totalTokens += e.tokens || 0;
    state.usageDays[e.date].totalCost += e.cost || 0;
    if (!state.usageDays[e.date].providers.includes(e.provider)) {
      state.usageDays[e.date].providers.push(e.provider);
    }
  }
}

/* ══════════════ PROVIDERS PAGE ══════════════ */

function renderProviders() {
  const grid = document.getElementById("providersGrid");
  const filter = state.providerFilter;

  const entries = Object.entries(PROVIDERS).filter(([, def]) => filter === "all" || def.category === filter);

  grid.innerHTML = entries.map(([key, def]) => {
    const prov = state.providers[key];
    const sPct = Math.min(100, Math.round((prov.session.used / prov.session.limit) * 100));
    const wPct = Math.min(100, Math.round((prov.weekly.used / prov.weekly.limit) * 100));
    const sFill = sPct > 90 ? "var(--danger)" : sPct > 70 ? "var(--amber)" : "var(--accent)";
    const wFill = wPct > 90 ? "var(--danger)" : wPct > 70 ? "var(--amber)" : "var(--blue)";
    const monthlyCost = prov.costs.reduce((s, c) => s + c.amount, 0);
    const resetIn = timeUntil(prov.session.resetAt);

    const displayVal = state.settings.displayMode === "pace"
      ? `${prov.session.used}/${prov.session.limit}`
      : state.settings.displayMode === "both"
        ? `${sPct}% (${prov.session.used}/${prov.session.limit})`
        : `${sPct}%`;

    return `<div class="provider-card ${prov.enabled ? "enabled" : ""}" data-key="${key}">
      <div class="provider-card-head">
        <div class="provider-card-icon" style="background:${def.color}12;border-color:${def.color}25">
          <img src="https://www.google.com/s2/favicons?domain=${def.domain}&sz=64" width="24" height="24" alt="" style="border-radius:4px"/>
        </div>
        <div class="provider-card-title">
          <div class="provider-card-name">${esc(def.name)}</div>
          <div class="provider-card-cat">${def.category} · ${prov.plan}</div>
        </div>
        <div class="provider-toggle ${prov.enabled ? "on" : ""}" data-toggle="${key}"></div>
      </div>
      <div class="provider-card-meters">
        <div class="meter-row">
          <span class="meter-label">Session</span>
          <div class="meter-bar"><div class="meter-fill" style="width:${sPct}%;background:${sFill}"></div></div>
          <span class="meter-value">${displayVal}</span>
        </div>
        <div class="meter-row">
          <span class="meter-label">Weekly</span>
          <div class="meter-bar"><div class="meter-fill" style="width:${wPct}%;background:${wFill}"></div></div>
          <span class="meter-value">${wPct}%</span>
        </div>
      </div>
      <div class="provider-card-footer">
        <span class="provider-cost-label">$${monthlyCost.toFixed(2)}</span>
        <span class="provider-reset">resets ${resetIn}</span>
      </div>
    </div>`;
  }).join("");

  // Toggle events
  grid.querySelectorAll(".provider-toggle").forEach(el => {
    el.addEventListener("click", e => {
      e.stopPropagation();
      const key = el.dataset.toggle;
      state.providers[key].enabled = !state.providers[key].enabled;
      persist();
      renderProviders();
      renderDashProviders();
      renderKPIs();
    });
  });

  // Card click -> detail
  grid.querySelectorAll(".provider-card").forEach(el => {
    el.addEventListener("click", () => openProviderDetail(el.dataset.key));
  });
}

/* ══════════════ PROVIDER DETAIL MODAL ══════════════ */

function openProviderDetail(key) {
  const def = PROVIDERS[key];
  const prov = state.providers[key];
  if (!def) return;

  const modal = document.getElementById("providerDetailModal");
  document.getElementById("providerDetailName").textContent = def.name;

  const sPct = Math.min(100, Math.round((prov.session.used / prov.session.limit) * 100));
  const wPct = Math.min(100, Math.round((prov.weekly.used / prov.weekly.limit) * 100));
  const sFill = sPct > 90 ? "var(--danger)" : sPct > 70 ? "var(--amber)" : "var(--accent)";
  const wFill = wPct > 90 ? "var(--danger)" : wPct > 70 ? "var(--amber)" : "var(--blue)";

  document.getElementById("providerDetailBody").innerHTML = `
    <div class="detail-quotas">
      <div class="detail-quota-row">
        <div class="detail-quota-head">
          <span class="detail-quota-label">Session Quota</span>
          <span class="detail-quota-value">${prov.session.used} / ${prov.session.limit}</span>
        </div>
        <div class="detail-bar"><div class="detail-fill" style="width:${sPct}%;background:${sFill}"></div></div>
        <div class="detail-reset">Resets ${timeUntil(prov.session.resetAt)}</div>
      </div>
      <div class="detail-quota-row">
        <div class="detail-quota-head">
          <span class="detail-quota-label">Weekly Quota</span>
          <span class="detail-quota-value">${prov.weekly.used} / ${prov.weekly.limit}</span>
        </div>
        <div class="detail-bar"><div class="detail-fill" style="width:${wPct}%;background:${wFill}"></div></div>
        <div class="detail-reset">Resets ${timeUntil(prov.weekly.resetAt)}</div>
      </div>
    </div>
    <div>
      <p style="font-size:0.78rem;color:var(--text-3);margin-bottom:6px;font-family:var(--font-mono)">API KEY</p>
      <div class="detail-api-row">
        <input class="detail-api-input" type="password" placeholder="Enter API key..." value="${esc(prov.apiKey)}" data-apikey="${key}"/>
        <button class="btn btn--ghost btn--sm" data-savekey="${key}">Save</button>
      </div>
    </div>
    <div>
      <p style="font-size:0.78rem;color:var(--text-3);margin-bottom:6px;font-family:var(--font-mono)">RECENT COST (30d): <strong style="color:var(--amber)">$${prov.costs.reduce((s, c) => s + c.amount, 0).toFixed(2)}</strong></p>
    </div>`;

  // Save API key
  const saveBtn = document.querySelector(`[data-savekey="${key}"]`);
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const input = document.querySelector(`[data-apikey="${key}"]`);
      prov.apiKey = input ? input.value : "";
      persist();
    });
  }

  modal.classList.add("open");
}

function closeProviderDetail() {
  document.getElementById("providerDetailModal").classList.remove("open");
}

/* ══════════════ ANALYTICS ══════════════ */

function renderAnalytics() {
  renderAnalyticsCostChart();
  renderAnalyticsBreakdown();
  renderAnalyticsTokenChart();
  renderAnalyticsPlanMeters();
}

function renderAnalyticsCostChart() {
  const container = document.getElementById("analyticsCostChart");
  const data = [];
  if (state.analyticsPeriod === "daily") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = dateKey(d);
      data.push({ label: d.getDate(), value: state.entries.filter(e => e.date === key).reduce((s, e) => s + (e.cost || 0), 0) });
    }
  } else if (state.analyticsPeriod === "weekly") {
    for (let w = 11; w >= 0; w--) {
      let total = 0;
      for (let d = 6; d >= 0; d--) {
        const dt = new Date(); dt.setDate(dt.getDate() - w * 7 - d);
        total += state.entries.filter(e => e.date === dateKey(dt)).reduce((s, e) => s + (e.cost || 0), 0);
      }
      data.push({ label: `W${12 - w}`, value: total });
    }
  } else {
    for (let m = 11; m >= 0; m--) {
      const dt = new Date(); dt.setMonth(dt.getMonth() - m);
      const prefix = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const total = state.entries.filter(e => e.date && e.date.startsWith(prefix)).reduce((s, e) => s + (e.cost || 0), 0);
      data.push({ label: dt.toLocaleString("default", { month: "short" }), value: total });
    }
  }

  const totalCost = data.reduce((s, d) => s + d.value, 0);
  document.getElementById("analyticsTotalCost").textContent = `$${totalCost.toFixed(2)}`;
  renderAreaChart(container, data, { color: "0, 229, 160", height: 220, showLabels: true, prefix: "$" });
}

function renderAnalyticsBreakdown() {
  const container = document.getElementById("analyticsBreakdown");
  const byCost = {};
  for (const e of state.entries) {
    byCost[e.provider] = (byCost[e.provider] || 0) + (e.cost || 0);
  }

  const sorted = Object.entries(byCost).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = Math.max(0.01, sorted.length ? sorted[0][1] : 1);

  container.innerHTML = sorted.map(([key, cost]) => {
    const def = PROVIDERS[key] || {};
    const pct = Math.round((cost / max) * 100);
    return `<div class="breakdown-row">
      <span class="breakdown-name">${esc(def.name || key)}</span>
      <div class="breakdown-bar-wrap"><div class="breakdown-fill" style="width:${pct}%;background:${def.color || '#666'}"></div></div>
      <span class="breakdown-val">$${cost.toFixed(2)}</span>
    </div>`;
  }).join("") || '<p class="empty-state">No data yet.</p>';
}

function renderAnalyticsTokenChart() {
  const container = document.getElementById("analyticsTokenChart");
  const byModel = {};
  for (const e of state.entries) {
    const key = e.model || e.provider || "Unknown";
    byModel[key] = (byModel[key] || 0) + (e.tokens || 0);
  }

  const sorted = Object.entries(byModel).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const data = sorted.map(([label, value]) => ({ label: label.length > 12 ? label.slice(0, 12) + "..." : label, value }));

  if (!data.length) { container.innerHTML = '<p class="empty-state">No token data yet.</p>'; return; }

  // Horizontal bar chart
  const max = Math.max(1, data[0].value);
  const barH = 28, gap = 8, pad = 100;
  const h = data.length * (barH + gap) + 20;

  const bars = data.map((d, i) => {
    const y = i * (barH + gap) + 10;
    const w2 = (d.value / max) * (700 - pad);
    const colors = ["#00e5a0", "#38bdf8", "#fbbf24", "#f87171", "#a855f7", "#ec4899", "#6366f1", "#14b8a6"];
    return `<text x="${pad - 8}" y="${y + barH / 2 + 4}" text-anchor="end" font-size="11" font-family="var(--font-mono)" fill="rgba(255,255,255,0.5)">${d.label}</text>
      <rect x="${pad}" y="${y}" width="${w2}" height="${barH}" rx="4" fill="${colors[i % colors.length]}" opacity="0.75"/>
      <text x="${pad + w2 + 8}" y="${y + barH / 2 + 4}" font-size="10" font-family="var(--font-mono)" fill="rgba(255,255,255,0.4)">${formatNumber(d.value)}</text>`;
  }).join("");

  container.innerHTML = `<svg viewBox="0 0 800 ${h}" width="100%" height="${h}" style="display:block">${bars}</svg>`;
}

function renderAnalyticsPlanMeters() {
  const container = document.getElementById("analyticsPlanMeters");
  const enabled = Object.entries(state.providers).filter(([, v]) => v.enabled);

  if (!enabled.length) { container.innerHTML = '<p class="empty-state">Enable providers to see plan utilization.</p>'; return; }

  container.innerHTML = enabled.map(([key, prov]) => {
    const def = PROVIDERS[key];
    const wPct = Math.min(100, Math.round((prov.weekly.used / prov.weekly.limit) * 100));
    const fill = wPct > 90 ? "var(--danger)" : wPct > 70 ? "var(--amber)" : "var(--accent)";
    return `<div class="plan-row">
      <div class="plan-row-head">
        <span class="plan-name">${esc(def.name)} (${prov.plan})</span>
        <span class="plan-pct">${wPct}%</span>
      </div>
      <div class="plan-bar"><div class="plan-fill" style="width:${wPct}%;background:${fill}"></div></div>
      <div class="plan-detail">${prov.weekly.used} / ${prov.weekly.limit} weekly · resets ${timeUntil(prov.weekly.resetAt)}</div>
    </div>`;
  }).join("");
}

/* ══════════════ CALENDAR / HEATMAP ══════════════ */

function renderCalendar() {
  document.getElementById("calLabel").textContent = String(state.calendarYear);
  renderHeatmap();
  renderCalStats();
}

function renderHeatmap() {
  const container = document.getElementById("heatmapContainer");
  const year = state.calendarYear;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Align to Sunday
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay());

  // Calculate max usage for intensity
  const allVals = Object.values(state.usageDays).map(d => d.totalTokens || 0);
  const maxVal = Math.max(1, ...allVals);

  let cells = "";
  let weekday = "";
  const dayLabels = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

  for (let i = 0; i < 7; i++) {
    weekday += `<div class="heatmap-weekday">${dayLabels[i]}</div>`;
  }

  const cur = new Date(start);
  let monthHeaders = [];
  let lastMonth = -1;
  let weekCount = 0;

  while (cur <= endDate || cur.getDay() !== 0) {
    if (cur.getDay() === 0) weekCount++;

    const key = dateKey(cur);
    const dayData = state.usageDays[key];
    const val = dayData ? dayData.totalTokens || 0 : 0;
    const level = val === 0 ? 0 : val < maxVal * 0.25 ? 1 : val < maxVal * 0.5 ? 2 : val < maxVal * 0.75 ? 3 : 4;
    const inRange = cur.getFullYear() === year;

    if (cur.getDay() === 0 && cur.getMonth() !== lastMonth && inRange) {
      monthHeaders.push({ month: cur.toLocaleString("default", { month: "short" }), week: weekCount });
      lastMonth = cur.getMonth();
    }

    cells += `<div class="heatmap-cell" data-level="${inRange ? level : 0}" data-date="${key}" title="${key}: ${formatNumber(val)} tokens"></div>`;

    cur.setDate(cur.getDate() + 1);
    if (cur > endDate && cur.getDay() === 0) break;
  }

  const monthLabelsHtml = monthHeaders.map(m =>
    `<span class="heatmap-month-label" style="grid-column:${m.week}">${m.month}</span>`
  ).join("");

  container.innerHTML = `
    <div style="display:flex;gap:6px">
      <div class="heatmap-weekdays">${weekday}</div>
      <div style="flex:1;overflow-x:auto">
        <div class="heatmap-months" style="display:grid;grid-auto-flow:column;grid-auto-columns:17px;margin-bottom:4px">${monthLabelsHtml}</div>
        <div class="heatmap-grid">${cells}</div>
      </div>
    </div>`;

  container.querySelectorAll(".heatmap-cell").forEach(cell => {
    cell.addEventListener("click", () => showDayDetail(cell.dataset.date));
  });
}

function showDayDetail(dateStr) {
  const detail = document.getElementById("calDetail");
  const dayEntries = state.entries.filter(e => e.date === dateStr);

  if (!dayEntries.length) {
    detail.innerHTML = `<div class="cal-detail-date">${dateStr}</div><p class="empty-state">No entries for this day.</p>`;
    return;
  }

  const totalTokens = dayEntries.reduce((s, e) => s + (e.tokens || 0), 0);
  const totalCost = dayEntries.reduce((s, e) => s + (e.cost || 0), 0);

  detail.innerHTML = `
    <div class="cal-detail-date">${dateStr}</div>
    <p style="font-size:0.8rem;color:var(--text-2);margin-bottom:8px">${dayEntries.length} entries · ${formatNumber(totalTokens)} tokens · $${totalCost.toFixed(2)}</p>
    <div class="cal-detail-entries">
      ${dayEntries.map(e => {
        const def = PROVIDERS[e.provider] || {};
        return `<div class="cal-detail-entry">
          <span><span class="entry-dot" style="background:${def.color || '#666'}"></span> ${esc(def.name || e.provider)} ${e.model ? `· ${esc(e.model)}` : ""}</span>
          <span style="font-family:var(--font-mono);color:var(--amber)">$${(e.cost || 0).toFixed(2)}</span>
        </div>`;
      }).join("")}
    </div>`;
}

function renderCalStats() {
  const container = document.getElementById("calStats");
  const year = state.calendarYear;
  const now = new Date();
  const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const yearEntries = state.entries.filter(e => e.date && e.date.startsWith(String(year)));
  const monthEntries = yearEntries.filter(e => e.date.startsWith(monthKey));
  const yearDays = new Set(yearEntries.map(e => e.date)).size;
  const monthDays = new Set(monthEntries.map(e => e.date)).size;
  const yearCost = yearEntries.reduce((s, e) => s + (e.cost || 0), 0);
  const yearTokens = yearEntries.reduce((s, e) => s + (e.tokens || 0), 0);

  container.innerHTML = [
    { label: "Active days (year)", value: yearDays },
    { label: "Active days (month)", value: monthDays },
    { label: "Total entries", value: yearEntries.length },
    { label: "Total tokens", value: formatNumber(yearTokens) },
    { label: "Total cost", value: `$${yearCost.toFixed(2)}` },
  ].map(s => `<div class="cal-stat"><span class="cal-stat-label">${s.label}</span><span class="cal-stat-value">${s.value}</span></div>`).join("");
}

/* ══════════════ ENTRY MODAL ══════════════ */

function populateEntryProviderSelect() {
  const select = document.getElementById("entryProvider");
  select.innerHTML = Object.entries(PROVIDERS).map(([key, def]) =>
    `<option value="${key}">${def.name}</option>`
  ).join("");
}

function openEntryModal() {
  document.getElementById("entryDate").value = dateKey(new Date());
  document.getElementById("addEntryModal").classList.add("open");
}

function closeEntryModal() {
  document.getElementById("addEntryModal").classList.remove("open");
  document.getElementById("entryForm").reset();
}

function handleEntrySubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const provider = fd.get("provider");
  const model = (fd.get("model") || "").trim();
  const tokens = parseInt(fd.get("tokens")) || 0;
  const cost = parseFloat(fd.get("cost")) || 0;
  const prompts = parseInt(fd.get("prompts")) || 0;
  const date = fd.get("date") || dateKey(new Date());

  state.entries.push({ id: crypto.randomUUID(), provider, model, tokens, cost, prompts, minutes: 0, date });

  // Update usage days
  if (!state.usageDays[date]) state.usageDays[date] = { totalTokens: 0, totalCost: 0, providers: [] };
  state.usageDays[date].totalTokens += tokens;
  state.usageDays[date].totalCost += cost;
  if (!state.usageDays[date].providers.includes(provider)) state.usageDays[date].providers.push(provider);

  // Update provider session/weekly usage
  if (state.providers[provider]) {
    state.providers[provider].session.used += prompts;
    state.providers[provider].weekly.used += prompts;
    state.providers[provider].costs.push({ date, amount: cost, tokens });
  }

  persist();
  closeEntryModal();
  renderAll();
}

/* ══════════════ SETTINGS ══════════════ */

function syncSettings() {
  document.getElementById("settingDisplayMode").value = state.settings.displayMode;
  document.getElementById("settingTheme").value = state.settings.theme;
  document.getElementById("settingRefresh").value = String(state.settings.refreshInterval);
}

function exportData() {
  const blob = new Blob([JSON.stringify({ providers: state.providers, entries: state.entries, settings: state.settings, usageDays: state.usageDays }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `aiusage-export-${dateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (d.providers) state.providers = d.providers;
      if (Array.isArray(d.entries)) state.entries = d.entries;
      if (d.settings) state.settings = { ...state.settings, ...d.settings };
      if (d.usageDays) state.usageDays = d.usageDays;
      persist();
      applyTheme();
      renderAll();
    } catch { alert("Invalid JSON file."); }
  };
  reader.readAsText(file);
}

function resetData() {
  if (!confirm("This will erase all data. Are you sure?")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(THEME_KEY);
  location.reload();
}

/* ══════════════ COUNTDOWN TIMERS ══════════════ */

function startCountdowns() {
  setInterval(() => {
    // Check for resets
    const now = new Date();
    for (const [, prov] of Object.entries(state.providers)) {
      if (new Date(prov.session.resetAt) <= now) {
        prov.session.used = 0;
        const next = new Date(now); next.setHours(next.getHours() + 4);
        prov.session.resetAt = next.toISOString();
      }
      if (new Date(prov.weekly.resetAt) <= now) {
        prov.weekly.used = 0;
        const next = new Date(now); next.setDate(next.getDate() + 7);
        prov.weekly.resetAt = next.toISOString();
      }
    }
  }, 60000);
}

/* ══════════════ UTILITIES ══════════════ */

function dateKey(d) {
  if (typeof d === "string") return d;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function timeUntil(isoStr) {
  const diff = new Date(isoStr) - new Date();
  if (diff <= 0) return "now";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
