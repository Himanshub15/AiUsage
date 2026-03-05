const STORAGE_KEY = "aiUsageHub.v5";
const THEME_KEY = "aiUsage.theme";

const ABOUT_CONTENT = {
  mission: {
    title: "Mission",
    message: "AiUsage helps you build a simple daily habit of tracking AI work, across every account you use.",
    detail: "Give users one clean place to track AI usage without complex setup.",
  },
  builder: {
    title: "Builder",
    message: "Created by Himanshu Bhusari with a focus on clean UX and practical tracking.",
    detail: "This product is designed to stay minimal, fast, and useful for daily professionals.",
  },
  vision: {
    title: "Vision",
    message: "Turn scattered AI usage into one clear operational view for teams and individuals.",
    detail: "Next steps include smarter analytics, usage goals, and account-level trend insights.",
  },
};

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SAMPLE_USAGE = {
  OpenAI: [18, 22, 24, 21, 25, 23, 28, 30, 27, 26, 31, 33, 36, 34, 37, 35, 39, 41, 38, 40, 42, 46, 44, 48, 47, 50, 52, 49, 54, 57],
  Claude: [11, 10, 12, 13, 15, 14, 13, 17, 16, 18, 17, 19, 20, 18, 19, 21, 20, 22, 23, 22, 24, 23, 26, 27, 25, 28, 29, 27, 30, 32],
};

const state = {
  homeDate: new Date(),
  usageDate: new Date(),
  usageView: "month",
  chartRange: 30,
  usageDays: {},
  entries: [],
  providerConnections: {
    OpenAI: { connected: false, key: "" },
    Claude: { connected: false, key: "" },
  },
};

const refs = {
  menuToggle: document.getElementById("menuToggle"),
  brandHome: document.getElementById("brandHome"),
  sidebar: document.getElementById("sidebar"),
  navItems: [...document.querySelectorAll(".nav-item")],
  pages: [...document.querySelectorAll(".page")],

  themeToggle: document.getElementById("themeToggle"),
  loginOpen: document.getElementById("loginOpen"),
  loginClose: document.getElementById("loginClose"),
  loginModal: document.getElementById("loginModal"),
  loginForm: document.getElementById("loginForm"),

  greetingText: document.getElementById("greetingText"),
  streakCount: document.getElementById("streakCount"),
  streakBadge: document.getElementById("streakBadge"),
  connectedCount: document.getElementById("connectedCount"),
  homeUsedDays: document.getElementById("homeUsedDays"),
  homePromptTotal: document.getElementById("homePromptTotal"),
  homeMinuteTotal: document.getElementById("homeMinuteTotal"),

  heatmapGrid: document.getElementById("heatmapGrid"),
  heatmapSummary: document.getElementById("heatmapSummary"),
  providerBreakdown: document.getElementById("providerBreakdown"),

  homePrevMonth: document.getElementById("homePrevMonth"),
  homeNextMonth: document.getElementById("homeNextMonth"),
  homeMonthLabel: document.getElementById("homeMonthLabel"),
  homeWeekdays: document.getElementById("homeWeekdays"),
  homeMonthCalendar: document.getElementById("homeMonthCalendar"),

  usagePrev: document.getElementById("usagePrev"),
  usageNext: document.getElementById("usageNext"),
  usageLabel: document.getElementById("usageLabel"),
  usageCalendarFrame: document.getElementById("usageCalendarFrame"),
  usageBarChart: document.getElementById("usageBarChart"),
  viewButtons: [...document.querySelectorAll(".mode-pill")],

  usedDays: document.getElementById("usedDays"),
  usedYearDays: document.getElementById("usedYearDays"),
  entryCount: document.getElementById("entryCount"),
  promptTotal: document.getElementById("promptTotal"),
  minuteTotal: document.getElementById("minuteTotal"),

  usageForm: document.getElementById("usageForm"),
  accountList: document.getElementById("accountList"),

  connectButtons: [...document.querySelectorAll("button[data-connect]")],
  removeKeyButtons: [...document.querySelectorAll("button[data-remove-key]")],
  statusPills: [...document.querySelectorAll("[data-status]")],

  usageChart: document.getElementById("usageChart"),
  chartFoot: document.getElementById("chartFoot"),
  rangeButtons: [...document.querySelectorAll(".range-pill")],

  aboutMessage: document.getElementById("aboutMessage"),
  aboutPanel: document.getElementById("aboutPanel"),
  aboutChips: [...document.querySelectorAll(".about-chip")],

  quickAddBtn: document.getElementById("quickAddBtn"),
  quickAddModal: document.getElementById("quickAddModal"),
  quickAddClose: document.getElementById("quickAddClose"),
  quickAddForm: document.getElementById("quickAddForm"),
};

init();

function init() {
  loadState();
  applyTheme();
  setGreeting();
  bindNavigation();
  bindTheme();
  bindLoginModal();
  bindHomeCalendar();
  bindUsageCalendar();
  bindUsageForm();
  bindProviderConnections();
  bindChartRange();
  bindAboutInteraction();
  bindQuickAdd();
  renderWeekdayHeader();
  renderAll();
}

/* ======== GREETING ======== */
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  if (refs.greetingText) refs.greetingText.textContent = greeting;
}

/* ======== STREAK ======== */
function calculateStreak() {
  let streak = 0;
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  while (true) {
    const key = dateKeyFromDate(d);
    if (state.usageDays[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderStreak() {
  const streak = calculateStreak();
  if (refs.streakCount) refs.streakCount.textContent = String(streak);
  if (refs.streakBadge) {
    refs.streakBadge.style.opacity = streak > 0 ? "1" : "0.5";
  }
}

/* ======== HEATMAP ======== */
function renderHeatmap() {
  if (!refs.heatmapGrid) return;

  const today = new Date();
  const totalDays = 182; // ~6 months
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - totalDays + 1);

  let html = "";
  let activeDays = 0;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const key = dateKeyFromDate(d);
    const isToday = key === dateKeyFromDate(today);
    const level = getActivityLevel(key);
    if (level > 0) activeDays++;

    const todayClass = isToday ? " today" : "";
    const tooltip = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    html += `<div class="heatmap-cell${todayClass}" data-level="${level}" data-date="${key}" title="${tooltip}"></div>`;
  }

  refs.heatmapGrid.innerHTML = html;

  // Click to toggle days on heatmap
  refs.heatmapGrid.querySelectorAll(".heatmap-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const key = cell.dataset.date;
      toggleDay(key, !state.usageDays[key]);
      persist();
      renderAll();
    });
  });

  if (refs.heatmapSummary) {
    refs.heatmapSummary.textContent = `${activeDays} active days in the last 6 months`;
  }
}

function getActivityLevel(dateKey) {
  const entryCount = state.entries.filter(
    (e) => e.createdAt && e.createdAt.startsWith(dateKey)
  ).length;
  if (entryCount >= 4) return 3;
  if (entryCount >= 2) return 2;
  if (entryCount >= 1) return 1;
  if (state.usageDays[dateKey]) return 1;
  return 0;
}

/* ======== PROVIDER BREAKDOWN ======== */
function renderProviderBreakdown() {
  if (!refs.providerBreakdown) return;

  const providerMap = {};
  state.entries.forEach((entry) => {
    const name = entry.provider.trim();
    if (!providerMap[name]) providerMap[name] = { prompts: 0, minutes: 0, count: 0 };
    providerMap[name].prompts += entry.prompts;
    providerMap[name].minutes += entry.minutes;
    providerMap[name].count += 1;
  });

  const providers = Object.entries(providerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.prompts - a.prompts);

  if (providers.length === 0) {
    refs.providerBreakdown.innerHTML = '<p class="empty-state">Add usage entries to see breakdown.</p>';
    return;
  }

  const maxPrompts = Math.max(1, ...providers.map((p) => p.prompts));

  refs.providerBreakdown.innerHTML = providers
    .map((p) => {
      const pct = Math.round((p.prompts / maxPrompts) * 100);
      return `
        <div class="breakdown-row">
          <span class="breakdown-name">${escapeHtml(p.name)}</span>
          <div class="breakdown-bar-bg">
            <div class="breakdown-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="breakdown-count">${p.prompts} prompts</span>
        </div>`;
    })
    .join("");
}

/* ======== ANIMATED COUNTERS ======== */
function animateCounter(element, target) {
  if (!element) return;
  const duration = 600;
  const start = performance.now();
  const from = 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(from + (target - from) * eased);
    element.textContent = String(current);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ======== QUICK ADD ======== */
function bindQuickAdd() {
  if (!refs.quickAddBtn) return;

  refs.quickAddBtn.addEventListener("click", () => {
    refs.quickAddModal.classList.add("open");
    refs.quickAddModal.setAttribute("aria-hidden", "false");
  });

  refs.quickAddClose.addEventListener("click", closeQuickAdd);

  refs.quickAddModal.addEventListener("click", (event) => {
    if (event.target === refs.quickAddModal) closeQuickAdd();
  });

  refs.quickAddForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(refs.quickAddForm);
    const provider = String(data.get("provider") || "").trim();
    const prompts = Number(data.get("prompts"));
    const minutes = Number(data.get("minutes"));

    if (!provider || Number.isNaN(prompts) || Number.isNaN(minutes)) return;

    state.entries.push({
      id: crypto.randomUUID(),
      provider,
      account: "quick-add",
      prompts,
      minutes,
      createdAt: new Date().toISOString(),
    });

    toggleDay(dateKeyFromDate(new Date()), true);
    refs.quickAddForm.reset();
    persist();
    renderAll();
    closeQuickAdd();
  });
}

function closeQuickAdd() {
  refs.quickAddModal.classList.remove("open");
  refs.quickAddModal.setAttribute("aria-hidden", "true");
}

/* ======== NAVIGATION ======== */
function bindNavigation() {
  refs.brandHome.addEventListener("click", () => navigateToPage("home"));

  refs.menuToggle.addEventListener("click", () => {
    const open = refs.sidebar.classList.toggle("open");
    refs.menuToggle.setAttribute("aria-expanded", String(open));
    refs.sidebar.setAttribute("aria-hidden", String(!open));
  });

  refs.navItems.forEach((item) => {
    item.addEventListener("click", () => navigateToPage(item.dataset.page));
  });

  document.addEventListener("click", (event) => {
    if (!refs.sidebar.classList.contains("open")) return;
    if (refs.sidebar.contains(event.target) || refs.menuToggle.contains(event.target)) return;
    closeSidebar();
  });
}

/* ======== THEME ======== */
function bindTheme() {
  refs.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(THEME_KEY, document.body.classList.contains("light") ? "light" : "dark");
    updateThemeButtonLabel();
  });
}

function applyTheme() {
  if (localStorage.getItem(THEME_KEY) === "light") document.body.classList.add("light");
  updateThemeButtonLabel();
}

function updateThemeButtonLabel() {
  const isLight = document.body.classList.contains("light");
  refs.themeToggle.setAttribute("aria-checked", String(isLight));
  refs.themeToggle.textContent = isLight ? "Dark" : "Light";
}

/* ======== LOGIN ======== */
function bindLoginModal() {
  refs.loginOpen.addEventListener("click", () => {
    refs.loginModal.classList.add("open");
    refs.loginModal.setAttribute("aria-hidden", "false");
  });
  refs.loginClose.addEventListener("click", closeLoginModal);
  refs.loginModal.addEventListener("click", (e) => { if (e.target === refs.loginModal) closeLoginModal(); });
  refs.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Login flow UI ready. Backend auth not connected yet.");
    closeLoginModal();
  });
}

/* ======== HOME CALENDAR ======== */
function bindHomeCalendar() {
  refs.homePrevMonth.addEventListener("click", () => {
    state.homeDate = new Date(state.homeDate.getFullYear(), state.homeDate.getMonth() - 1, 1);
    renderHomeCalendar(); renderStats(); renderHomeMetrics();
  });
  refs.homeNextMonth.addEventListener("click", () => {
    state.homeDate = new Date(state.homeDate.getFullYear(), state.homeDate.getMonth() + 1, 1);
    renderHomeCalendar(); renderStats(); renderHomeMetrics();
  });
}

/* ======== USAGE CALENDAR ======== */
function bindUsageCalendar() {
  refs.viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.usageView = btn.dataset.view;
      refs.viewButtons.forEach((b) => b.classList.toggle("active", b === btn));
      renderUsageCalendar();
    });
  });
  refs.usagePrev.addEventListener("click", () => { stepUsageDate(-1); renderUsageCalendar(); });
  refs.usageNext.addEventListener("click", () => { stepUsageDate(1); renderUsageCalendar(); });
}

function stepUsageDate(delta) {
  const base = state.usageDate;
  if (state.usageView === "week") state.usageDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7 * delta);
  else if (state.usageView === "month") state.usageDate = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  else state.usageDate = new Date(base.getFullYear() + delta, 0, 1);
}

/* ======== USAGE FORM ======== */
function bindUsageForm() {
  refs.usageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(refs.usageForm);
    const provider = String(data.get("provider") || "").trim();
    const account = String(data.get("account") || "").trim();
    const prompts = Number(data.get("prompts"));
    const minutes = Number(data.get("minutes"));
    if (!provider || !account || Number.isNaN(prompts) || Number.isNaN(minutes)) return;

    state.entries.push({
      id: crypto.randomUUID(), provider, account, prompts, minutes,
      createdAt: new Date().toISOString(),
    });

    toggleDay(dateKeyFromDate(new Date()), true);
    refs.usageForm.reset();
    persist();
    renderAll();
  });
}

/* ======== PROVIDER CONNECTIONS ======== */
function bindProviderConnections() {
  refs.connectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.connect;
      const input = document.querySelector(`[data-key-input="${provider}"]`);
      const keyValue = String(input?.value || "").trim();
      const connected = !!state.providerConnections[provider]?.connected;

      if (connected) {
        state.providerConnections[provider] = { connected: false, key: "" };
        if (input) input.value = "";
      } else {
        if (!keyValue) { input?.focus(); return; }
        state.providerConnections[provider] = { connected: true, key: keyValue.slice(0, 6) };
      }
      persist(); renderProviderStates(); renderHomeMetrics(); renderChart();
    });
  });

  refs.removeKeyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.removeKey;
      state.providerConnections[provider] = { connected: false, key: "" };
      const input = document.querySelector(`[data-key-input="${provider}"]`);
      if (input) input.value = "";
      persist(); renderProviderStates(); renderHomeMetrics(); renderChart();
    });
  });
}

function bindChartRange() {
  refs.rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.chartRange = Number(button.dataset.range);
      refs.rangeButtons.forEach((b) => b.classList.toggle("active", b === button));
      renderChart();
    });
  });
}

function bindAboutInteraction() {
  refs.aboutChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      refs.aboutChips.forEach((n) => n.classList.toggle("active", n === chip));
      renderAbout(chip.dataset.about);
    });
  });
}

/* ======== RENDER ALL ======== */
function renderWeekdayHeader() {
  refs.homeWeekdays.innerHTML = WEEKDAY.map((d) => `<span>${d}</span>`).join("");
}

function renderAll() {
  renderHomeCalendar();
  renderUsageCalendar();
  renderUsageBarChart();
  renderEntries();
  renderStats();
  renderProviderStates();
  renderHomeMetrics();
  renderChart();
  renderAbout("mission");
  renderStreak();
  renderHeatmap();
  renderProviderBreakdown();
}

/* ======== HOME CALENDAR ======== */
function renderHomeCalendar() {
  const y = state.homeDate.getFullYear();
  const m = state.homeDate.getMonth();
  refs.homeMonthLabel.textContent = state.homeDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  refs.homeMonthCalendar.innerHTML = buildMonthCells(y, m, "day-cell", { markToday: true });
  bindCalendarClicks(refs.homeMonthCalendar);
}

/* ======== USAGE CALENDAR ======== */
function renderUsageCalendar() {
  if (state.usageView === "week") { renderUsageWeek(); return; }
  if (state.usageView === "month") { renderUsageMonth(); return; }
  renderUsageYear();
}

function renderUsageWeek() {
  const start = startOfWeek(state.usageDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = dateKeyFromDate(d);
    const active = state.usageDays[key] ? "active" : "";
    days.push(`<button class="day-cell ${active}" data-date="${key}"><span>${WEEKDAY[i]}</span><strong>${d.getDate()}</strong></button>`);
  }
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  refs.usageLabel.textContent = `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  refs.usageCalendarFrame.innerHTML = `<div class="usage-week-grid">${days.join("")}</div>`;
  bindCalendarClicks(refs.usageCalendarFrame);
}

function renderUsageMonth() {
  const anchor = new Date(state.usageDate.getFullYear(), state.usageDate.getMonth(), 1);
  refs.usageLabel.textContent = `Month overview from ${anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
  const blocks = [];
  for (let i = 0; i < 18; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    blocks.push(`
      <article class="usage-month-card">
        <h4>${d.toLocaleDateString(undefined, { month: "short", year: "numeric" })}</h4>
        <div class="usage-month-mini-grid">${buildMonthCells(d.getFullYear(), d.getMonth(), "usage-month-mini-cell", { compact: true })}</div>
      </article>`);
  }
  refs.usageCalendarFrame.innerHTML = `<div class="usage-month-overview"><div class="usage-month-overview-grid">${blocks.join("")}</div></div>`;
  bindCalendarClicks(refs.usageCalendarFrame);
}

function renderUsageYear() {
  const y = state.usageDate.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  refs.usageLabel.textContent = String(y);
  refs.usageCalendarFrame.innerHTML = `
    <div class="usage-year-grid">
      ${months.map((name, i) => `
        <article class="year-mini">
          <h4>${name}</h4>
          <div class="year-mini-grid">${buildMonthCells(y, i, "year-mini-cell", { compact: true })}</div>
        </article>`).join("")}
    </div>`;
  bindCalendarClicks(refs.usageCalendarFrame);
}

function buildMonthCells(year, month, className, options = {}) {
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const total = options.compact ? Math.ceil((firstDay + days) / 7) * 7 : 42;
  const todayKey = dateKeyFromDate(new Date());
  let cursor = 1;
  let html = "";

  for (let i = 0; i < total; i++) {
    if (i < firstDay || cursor > days) {
      html += `<span class="${className} empty"></span>`;
      continue;
    }
    const key = dateKey(year, month, cursor);
    const active = state.usageDays[key] ? " active" : "";
    const today = options.markToday && key === todayKey ? " today" : "";
    html += `<button class="${className}${active}${today}" data-date="${key}">${cursor}</button>`;
    cursor++;
  }
  return html;
}

/* ======== BAR CHART ======== */
function renderUsageBarChart() {
  const points = collectUsageBarPoints();
  const w = 900, h = 200, p = 22;
  const max = Math.max(1, ...points.map((d) => d.value));
  const barGap = 3;
  const barW = Math.max(3, (w - p * 2 - barGap * (points.length - 1)) / points.length);

  const bars = points.map((pt, i) => {
    const x = p + i * (barW + barGap);
    const barH = (pt.value / max) * (h - p * 2);
    const y = h - p - barH;
    const fill = pt.value > 0 ? "rgba(52,211,153,0.75)" : "rgba(90,95,122,0.1)";
    return `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(2, barH)}" rx="2" fill="${fill}" />`;
  }).join("");

  const labels = points
    .filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
    .map((pt) => {
      const idx = points.indexOf(pt);
      const x = p + idx * (barW + barGap) + barW / 2;
      return `<text x="${x}" y="${h - 4}" text-anchor="middle" font-size="9" fill="rgba(90,95,122,0.6)" font-family="JetBrains Mono,monospace">${pt.label}</text>`;
    }).join("");

  refs.usageBarChart.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="200" role="img" aria-label="Usage bars">
      <line x1="${p}" y1="${h - p}" x2="${w - p}" y2="${h - p}" stroke="rgba(90,95,122,0.15)" stroke-width="1" />
      ${bars}${labels}
    </svg>`;
}

function collectUsageBarPoints() {
  if (state.usageView === "week") {
    const start = startOfWeek(state.usageDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { label: String(d.getDate()), value: dayUsageValue(dateKeyFromDate(d)) };
    });
  }
  const y = state.usageDate.getFullYear(), m = state.usageDate.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    return { label: String(i + 1), value: dayUsageValue(dateKey(y, m, i + 1)) };
  });
}

function dayUsageValue(key) {
  const count = state.entries.filter((e) => e.createdAt && e.createdAt.startsWith(key)).length;
  return count > 0 ? count : state.usageDays[key] ? 1 : 0;
}

/* ======== LINE CHART ======== */
function renderChart() {
  const preferred = state.providerConnections.OpenAI.connected ? "OpenAI" : state.providerConnections.Claude.connected ? "Claude" : "OpenAI";
  const source = SAMPLE_USAGE[preferred];
  const points = source.slice(-state.chartRange);
  const w = 860, h = 210, p = 20;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = p + (idx / (points.length - 1 || 1)) * (w - p * 2);
    const y = h - p - ((val - min) / range) * (h - p * 2);
    return `${x},${y}`;
  }).join(" ");

  refs.usageChart.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="210" role="img" aria-label="${preferred} usage trend">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(0,212,255,0.9)" />
          <stop offset="100%" stop-color="rgba(167,139,250,0.9)" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,212,255,0.1)" />
          <stop offset="100%" stop-color="rgba(0,212,255,0)" />
        </linearGradient>
      </defs>
      <line x1="${p}" y1="${h - p}" x2="${w - p}" y2="${h - p}" stroke="rgba(90,95,122,0.15)" stroke-width="1" />
      <polygon fill="url(#areaGrad)" points="${p},${h - p} ${coords} ${w - p * 2 + p},${h - p}" opacity="0.6" />
      <polyline fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${coords}" />
      ${points.map((val, idx) => {
        const x = p + (idx / (points.length - 1 || 1)) * (w - p * 2);
        const y = h - p - ((val - min) / range) * (h - p * 2);
        return `<circle cx="${x}" cy="${y}" r="2.2" fill="rgba(0,212,255,1)" />`;
      }).join("")}
    </svg>`;

  const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  refs.chartFoot.textContent = `${preferred} sample: avg ${avg} prompts/day`;
}

/* ======== CALENDAR CLICK HANDLER ======== */
function bindCalendarClicks(root) {
  root.querySelectorAll("button[data-date]").forEach((node) => {
    node.addEventListener("click", () => {
      toggleDay(node.dataset.date, !state.usageDays[node.dataset.date]);
      persist();
      renderAll();
    });
  });
}

/* ======== ENTRIES ======== */
function renderEntries() {
  if (!state.entries.length) {
    refs.accountList.innerHTML = '<p class="mini-label">No usage entries yet.</p>';
    return;
  }
  refs.accountList.innerHTML = state.entries.map((e) => `
    <article class="entry-row">
      <strong>${escapeHtml(e.provider)}</strong>
      <span>${escapeHtml(e.account)}</span>
      <span>${e.prompts} prompts</span>
      <span>${e.minutes} min</span>
      <button class="remove-btn" data-remove="${e.id}">Remove</button>
    </article>`).join("");

  refs.accountList.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.entries = state.entries.filter((e) => e.id !== btn.dataset.remove);
      persist(); renderAll();
    });
  });
}

/* ======== STATS ======== */
function renderStats() {
  const mY = state.homeDate.getFullYear(), mM = state.homeDate.getMonth();
  const usedMonth = Object.keys(state.usageDays).filter((k) => {
    const d = new Date(`${k}T00:00:00`);
    return d.getFullYear() === mY && d.getMonth() === mM;
  }).length;

  const currentYear = new Date().getFullYear();
  const usedYear = Object.keys(state.usageDays).filter((k) => k.startsWith(`${currentYear}-`)).length;

  const totals = state.entries.reduce((a, e) => ({ prompts: a.prompts + e.prompts, minutes: a.minutes + e.minutes }), { prompts: 0, minutes: 0 });

  refs.usedDays.textContent = String(usedMonth);
  refs.usedYearDays.textContent = String(usedYear);
  refs.entryCount.textContent = String(state.entries.length);
  refs.promptTotal.textContent = String(totals.prompts);
  refs.minuteTotal.textContent = String(totals.minutes);
}

function renderProviderStates() {
  refs.statusPills.forEach((pill) => {
    const provider = pill.dataset.status;
    const conn = state.providerConnections[provider];
    const connected = !!conn?.connected;
    pill.textContent = connected ? `Connected (${conn.key}...)` : "Not connected";
    pill.classList.toggle("connected", connected);

    const connectBtn = document.querySelector(`[data-connect="${provider}"]`);
    const removeBtn = document.querySelector(`[data-remove-key="${provider}"]`);
    if (connectBtn) connectBtn.textContent = connected ? "Disconnect" : "Connect";
    if (removeBtn) removeBtn.classList.toggle("show", connected);
  });
}

function renderHomeMetrics() {
  const connected = Object.values(state.providerConnections).filter((p) => p.connected).length;
  const totals = state.entries.reduce((a, e) => ({ prompts: a.prompts + e.prompts, minutes: a.minutes + e.minutes }), { prompts: 0, minutes: 0 });
  const y = state.homeDate.getFullYear(), m = state.homeDate.getMonth();
  const used = Object.keys(state.usageDays).filter((k) => {
    const d = new Date(`${k}T00:00:00`);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  // Animate counters
  animateCounter(refs.connectedCount, connected);
  animateCounter(refs.homeUsedDays, used);
  animateCounter(refs.homePromptTotal, totals.prompts);
  animateCounter(refs.homeMinuteTotal, totals.minutes);
}

function renderAbout(key) {
  const s = ABOUT_CONTENT[key] || ABOUT_CONTENT.mission;
  refs.aboutMessage.textContent = s.message;
  refs.aboutPanel.innerHTML = `<h4>${s.title}</h4><p>${s.detail}</p>`;
}

/* ======== NAV HELPERS ======== */
function navigateToPage(pageName) {
  refs.navItems.forEach((n) => n.classList.toggle("active", n.dataset.page === pageName));
  refs.pages.forEach((p) => p.classList.toggle("active", p.dataset.page === pageName));
  closeSidebar();
  window.scrollTo(0, 0);
}

function closeSidebar() {
  refs.sidebar.classList.remove("open");
  refs.menuToggle.setAttribute("aria-expanded", "false");
  refs.sidebar.setAttribute("aria-hidden", "true");
}

function closeLoginModal() {
  refs.loginModal.classList.remove("open");
  refs.loginModal.setAttribute("aria-hidden", "true");
}

/* ======== DATA HELPERS ======== */
function toggleDay(key, active) {
  if (active) state.usageDays[key] = true;
  else delete state.usageDays[key];
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    usageDays: state.usageDays,
    entries: state.entries,
    providerConnections: state.providerConnections,
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.usageDays = parsed.usageDays && typeof parsed.usageDays === "object" ? parsed.usageDays : {};
    state.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    if (parsed.providerConnections && typeof parsed.providerConnections === "object") {
      state.providerConnections = { ...state.providerConnections, ...parsed.providerConnections };
    }
  } catch {
    state.usageDays = {};
    state.entries = [];
  }
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function dateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKeyFromDate(date) {
  return dateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
