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

  connectedCount: document.getElementById("connectedCount"),
  homeUsedDays: document.getElementById("homeUsedDays"),
  homePromptTotal: document.getElementById("homePromptTotal"),

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
};

init();

function init() {
  loadState();
  applyTheme();
  bindNavigation();
  bindTheme();
  bindLoginModal();
  bindHomeCalendar();
  bindUsageCalendar();
  bindUsageForm();
  bindProviderConnections();
  bindChartRange();
  bindAboutInteraction();
  renderWeekdayHeader();
  renderAll();
}

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
    const sidebarOpen = refs.sidebar.classList.contains("open");
    if (!sidebarOpen) return;

    const target = event.target;
    if (refs.sidebar.contains(target) || refs.menuToggle.contains(target)) return;
    closeSidebar();
  });
}

function bindTheme() {
  refs.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(THEME_KEY, document.body.classList.contains("light") ? "light" : "dark");
    updateThemeButtonLabel();
  });
}

function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") {
    document.body.classList.add("light");
  }
  updateThemeButtonLabel();
}

function updateThemeButtonLabel() {
  const isLight = document.body.classList.contains("light");
  refs.themeToggle.setAttribute("aria-checked", String(isLight));
  refs.themeToggle.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
  refs.themeToggle.textContent = isLight ? "Dark" : "Light";
}

function bindLoginModal() {
  refs.loginOpen.addEventListener("click", () => {
    refs.loginModal.classList.add("open");
    refs.loginModal.setAttribute("aria-hidden", "false");
  });

  refs.loginClose.addEventListener("click", closeLoginModal);

  refs.loginModal.addEventListener("click", (event) => {
    if (event.target === refs.loginModal) closeLoginModal();
  });

  refs.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Login flow UI is ready. Backend auth is not connected yet.");
    closeLoginModal();
  });
}

function bindHomeCalendar() {
  refs.homePrevMonth.addEventListener("click", () => {
    state.homeDate = new Date(state.homeDate.getFullYear(), state.homeDate.getMonth() - 1, 1);
    renderHomeCalendar();
    renderStats();
    renderHomeMetrics();
  });

  refs.homeNextMonth.addEventListener("click", () => {
    state.homeDate = new Date(state.homeDate.getFullYear(), state.homeDate.getMonth() + 1, 1);
    renderHomeCalendar();
    renderStats();
    renderHomeMetrics();
  });
}

function bindUsageCalendar() {
  refs.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.usageView = button.dataset.view;
      refs.viewButtons.forEach((b) => b.classList.toggle("active", b === button));
      renderUsageCalendar();
    });
  });

  refs.usagePrev.addEventListener("click", () => {
    stepUsageDate(-1);
    renderUsageCalendar();
  });

  refs.usageNext.addEventListener("click", () => {
    stepUsageDate(1);
    renderUsageCalendar();
  });
}

function stepUsageDate(delta) {
  const base = state.usageDate;
  if (state.usageView === "week") {
    state.usageDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7 * delta);
  } else if (state.usageView === "month") {
    state.usageDate = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  } else {
    state.usageDate = new Date(base.getFullYear() + delta, 0, 1);
  }
}

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
      id: crypto.randomUUID(),
      provider,
      account,
      prompts,
      minutes,
      createdAt: new Date().toISOString(),
    });

    toggleDay(dateKeyFromDate(new Date()), true);
    refs.usageForm.reset();
    persist();
    renderAll();
  });
}

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
        if (!keyValue) {
          input?.focus();
          return;
        }
        state.providerConnections[provider] = { connected: true, key: keyValue.slice(0, 6) };
      }

      persist();
      renderProviderStates();
      renderHomeMetrics();
      renderChart();
    });
  });

  refs.removeKeyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.removeKey;
      state.providerConnections[provider] = { connected: false, key: "" };
      const input = document.querySelector(`[data-key-input="${provider}"]`);
      if (input) input.value = "";
      persist();
      renderProviderStates();
      renderHomeMetrics();
      renderChart();
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
      const selected = chip.dataset.about;
      refs.aboutChips.forEach((node) => node.classList.toggle("active", node === chip));
      renderAbout(selected);
    });
  });
}

function renderWeekdayHeader() {
  refs.homeWeekdays.innerHTML = WEEKDAY.map((day) => `<span>${day}</span>`).join("");
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
}

function renderHomeCalendar() {
  const y = state.homeDate.getFullYear();
  const m = state.homeDate.getMonth();
  refs.homeMonthLabel.textContent = state.homeDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  refs.homeMonthCalendar.innerHTML = buildMonthCells(y, m, "day-cell", { compact: true });
  bindCalendarClicks(refs.homeMonthCalendar);
}

function renderUsageCalendar() {
  if (state.usageView === "week") {
    renderUsageWeek();
    return;
  }

  if (state.usageView === "month") {
    renderUsageMonth();
    return;
  }

  renderUsageYear();
}

function renderUsageWeek() {
  const start = startOfWeek(state.usageDate);
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = dateKeyFromDate(d);
    const active = state.usageDays[key] ? "active" : "";
    days.push(`<button class="day-cell ${active}" data-date="${key}"><span>${WEEKDAY[i]}</span><strong>${d.getDate()}</strong></button>`);
  }

  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  refs.usageLabel.textContent = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  refs.usageCalendarFrame.innerHTML = `<div class="usage-week-grid">${days.join("")}</div>`;
  bindCalendarClicks(refs.usageCalendarFrame);
}

function renderUsageMonth() {
  const anchor = new Date(state.usageDate.getFullYear(), state.usageDate.getMonth(), 1);
  refs.usageLabel.textContent = `Month overview from ${anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;

  const blocks = [];
  for (let i = 0; i < 18; i += 1) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    blocks.push(`
      <article class="usage-month-card">
        <h4>${d.toLocaleDateString(undefined, { month: "short", year: "numeric" })}</h4>
        <div class="usage-month-mini-grid">${buildMonthCells(y, m, "usage-month-mini-cell", { compact: true })}</div>
      </article>
    `);
  }

  refs.usageCalendarFrame.innerHTML = `
    <div class="usage-month-overview">
      <div class="usage-month-overview-grid">${blocks.join("")}</div>
    </div>
  `;
  bindCalendarClicks(refs.usageCalendarFrame);
}

function renderUsageYear() {
  const y = state.usageDate.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  refs.usageLabel.textContent = String(y);

  refs.usageCalendarFrame.innerHTML = `
    <div class="usage-year-grid">
      ${monthNames
        .map((name, index) => {
          return `
            <article class="year-mini">
              <h4>${name}</h4>
              <div class="year-mini-grid">${buildMonthCells(y, index, "year-mini-cell", { compact: true })}</div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  bindCalendarClicks(refs.usageCalendarFrame);
}

function buildMonthCells(year, month, className, options = {}) {
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const total = options.compact ? Math.ceil((firstDay + days) / 7) * 7 : 42;
  let cursor = 1;
  let html = "";

  for (let i = 0; i < total; i += 1) {
    if (i < firstDay || cursor > days) {
      html += `<span class="${className} empty"></span>`;
      continue;
    }

    const key = dateKey(year, month, cursor);
    const active = state.usageDays[key] ? "active" : "";
    html += `<button class="${className} ${active}" data-date="${key}">${cursor}</button>`;
    cursor += 1;
  }

  return html;
}

function renderUsageBarChart() {
  const points = collectUsageBarPoints();
  const w = 900;
  const h = 220;
  const p = 24;
  const max = Math.max(1, ...points.map((d) => d.value));
  const barGap = 3;
  const usableW = w - p * 2;
  const barW = Math.max(3, (usableW - barGap * (points.length - 1)) / points.length);

  const bars = points
    .map((point, i) => {
      const x = p + i * (barW + barGap);
      const barH = (point.value / max) * (h - p * 2);
      const y = h - p - barH;
      const fill = point.value > 0 ? "rgba(93,230,187,0.86)" : "rgba(120,138,175,0.22)";
      return `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(2, barH)}" rx="2" fill="${fill}" />`;
    })
    .join("");

  const labels = points
    .filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
    .map((point, i, arr) => {
      const idx = points.indexOf(point);
      const x = p + idx * (barW + barGap) + barW / 2;
      return `<text x="${x}" y="${h - 4}" text-anchor="middle" font-size="10" fill="rgba(140,160,210,0.8)">${point.label}</text>`;
    })
    .join("");

  refs.usageBarChart.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="220" role="img" aria-label="Usage bars by day">
      <line x1="${p}" y1="${h - p}" x2="${w - p}" y2="${h - p}" stroke="rgba(120,140,185,0.35)" stroke-width="1" />
      ${bars}
      ${labels}
    </svg>
  `;
}

function collectUsageBarPoints() {
  if (state.usageView === "week") {
    const start = startOfWeek(state.usageDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = dateKeyFromDate(d);
      return { label: String(d.getDate()), value: dayUsageValue(key) };
    });
  }

  const y = state.usageDate.getFullYear();
  const m = state.usageDate.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const key = dateKey(y, m, day);
    return { label: String(day), value: dayUsageValue(key) };
  });
}

function dayUsageValue(key) {
  const count = state.entries.filter((entry) => entry.createdAt && entry.createdAt.startsWith(key)).length;
  if (count > 0) return count;
  return state.usageDays[key] ? 1 : 0;
}

function bindCalendarClicks(root) {
  root.querySelectorAll("button[data-date]").forEach((node) => {
    node.addEventListener("click", () => {
      const key = node.dataset.date;
      toggleDay(key, !state.usageDays[key]);
      persist();
      renderAll();
    });
  });
}

function renderEntries() {
  if (!state.entries.length) {
    refs.accountList.innerHTML = '<p class="mini-label">No usage entries yet.</p>';
    return;
  }

  refs.accountList.innerHTML = state.entries
    .map(
      (entry) => `
      <article class="entry-row">
        <strong>${escapeHtml(entry.provider)}</strong>
        <span>${escapeHtml(entry.account)}</span>
        <span>${entry.prompts} prompts</span>
        <span>${entry.minutes} min</span>
        <button class="remove-btn" data-remove="${entry.id}">Remove</button>
      </article>
    `
    )
    .join("");

  refs.accountList.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      state.entries = state.entries.filter((entry) => entry.id !== button.dataset.remove);
      persist();
      renderAll();
    });
  });
}

function renderStats() {
  const monthY = state.homeDate.getFullYear();
  const monthM = state.homeDate.getMonth();

  const usedMonth = Object.keys(state.usageDays).filter((key) => {
    const d = new Date(`${key}T00:00:00`);
    return d.getFullYear() === monthY && d.getMonth() === monthM;
  }).length;

  const currentYear = new Date().getFullYear();
  const usedYear = Object.keys(state.usageDays).filter((key) => key.startsWith(`${currentYear}-`)).length;

  const totals = state.entries.reduce(
    (acc, entry) => {
      acc.prompts += entry.prompts;
      acc.minutes += entry.minutes;
      return acc;
    },
    { prompts: 0, minutes: 0 }
  );

  refs.usedDays.textContent = String(usedMonth);
  refs.usedYearDays.textContent = String(usedYear);
  refs.entryCount.textContent = String(state.entries.length);
  refs.promptTotal.textContent = String(totals.prompts);
  refs.minuteTotal.textContent = String(totals.minutes);
}

function renderProviderStates() {
  refs.statusPills.forEach((pill) => {
    const provider = pill.dataset.status;
    const connection = state.providerConnections[provider];
    const connected = !!connection?.connected;

    pill.textContent = connected ? `Connected (${connection.key}...)` : "Not connected";
    pill.classList.toggle("connected", connected);

    const connectButton = document.querySelector(`[data-connect="${provider}"]`);
    const removeButton = document.querySelector(`[data-remove-key="${provider}"]`);
    if (connectButton) connectButton.textContent = connected ? "Disconnect" : "Connect";
    if (removeButton) removeButton.classList.toggle("show", connected);
  });
}

function renderHomeMetrics() {
  const connected = Object.values(state.providerConnections).filter((item) => item.connected).length;
  const totals = state.entries.reduce((acc, entry) => ({ prompts: acc.prompts + entry.prompts }), { prompts: 0 });

  const y = state.homeDate.getFullYear();
  const m = state.homeDate.getMonth();
  const used = Object.keys(state.usageDays).filter((key) => {
    const d = new Date(`${key}T00:00:00`);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  refs.connectedCount.textContent = String(connected);
  refs.homeUsedDays.textContent = `${used} days`;
  refs.homePromptTotal.textContent = String(totals.prompts);
}

function renderChart() {
  const preferred = state.providerConnections.OpenAI.connected ? "OpenAI" : state.providerConnections.Claude.connected ? "Claude" : "OpenAI";
  const source = SAMPLE_USAGE[preferred];
  const points = source.slice(-state.chartRange);

  const w = 860;
  const h = 230;
  const p = 22;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points
    .map((val, idx) => {
      const x = p + (idx / (points.length - 1 || 1)) * (w - p * 2);
      const y = h - p - ((val - min) / range) * (h - p * 2);
      return `${x},${y}`;
    })
    .join(" ");

  refs.usageChart.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="230" role="img" aria-label="${preferred} usage trend">
      <polyline fill="none" stroke="rgba(110,168,255,0.35)" stroke-width="1" points="${p},${h - p} ${w - p},${h - p}" />
      <polyline fill="none" stroke="rgba(93,230,187,0.92)" stroke-width="3" points="${coords}" />
      ${points
        .map((val, idx) => {
          const x = p + (idx / (points.length - 1 || 1)) * (w - p * 2);
          const y = h - p - ((val - min) / range) * (h - p * 2);
          return `<circle cx="${x}" cy="${y}" r="2.7" fill="rgba(93,230,187,1)" />`;
        })
        .join("")}
    </svg>
  `;

  const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  refs.chartFoot.textContent = `${preferred} sample usage: avg ${avg} prompts/day in the selected period.`;
}

function renderAbout(key) {
  const selected = ABOUT_CONTENT[key] || ABOUT_CONTENT.mission;
  refs.aboutMessage.textContent = selected.message;
  refs.aboutPanel.innerHTML = `<h4>${selected.title}</h4><p>${selected.detail}</p>`;
}

function navigateToPage(pageName) {
  refs.navItems.forEach((node) => node.classList.toggle("active", node.dataset.page === pageName));
  refs.pages.forEach((page) => page.classList.toggle("active", page.dataset.page === pageName));
  closeSidebar();
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

function toggleDay(key, active) {
  if (active) state.usageDays[key] = true;
  else delete state.usageDays[key];
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      usageDays: state.usageDays,
      entries: state.entries,
      providerConnections: state.providerConnections,
    })
  );
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    state.usageDays = parsed.usageDays && typeof parsed.usageDays === "object" ? parsed.usageDays : {};
    state.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    if (parsed.providerConnections && typeof parsed.providerConnections === "object") {
      state.providerConnections = {
        ...state.providerConnections,
        ...parsed.providerConnections,
      };
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
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function dateKeyFromDate(date) {
  return dateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
