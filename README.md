# AiUsage

> A comprehensive AI usage monitoring dashboard — track tokens, costs, and quotas across 24+ providers in one place.

**Live:** [ai-usage-opal.vercel.app](https://ai-usage-opal.vercel.app/) &nbsp;|&nbsp; **Mirror:** [himanshub15.github.io/AiUsage](https://himanshub15.github.io/AiUsage/)

![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)
![GitHub Pages](https://img.shields.io/badge/Mirror-GitHub%20Pages-222222?style=for-the-badge&logo=github)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-111827?style=for-the-badge&logo=javascript)

---

## What's New in v2.0

Completely rebuilt from the ground up, inspired by [CodexBar](https://github.com/steipete/codexbar). The concept is the same — monitor your AI usage — but now with the depth and polish of a real monitoring tool.

### Key Changes from v1.0

| Feature | v1.0 | v2.0 |
|---|---|---|
| Providers | 2 (OpenAI, Claude) | **24+** (Claude, OpenAI, Gemini, Cursor, Copilot, DeepSeek, Mistral, etc.) |
| Quota tracking | None | **Dual meters** — session + weekly limits with reset countdowns |
| Cost tracking | None | **Per-provider cost history** with 30-day rolling charts |
| Analytics | Sample line chart | **Full analytics suite** — cost breakdown, token usage by model, plan utilization |
| Calendar | Click-to-mark days | **GitHub-style heatmap** with intensity levels and day detail |
| Data model | Prompts + minutes | **Tokens, cost, model, provider, date** per entry |
| Settings | Theme only | **Display mode, refresh interval, data export/import, reset** |
| Design | Basic cards | **Glassmorphic dashboard** with sparklines, quota bars, area charts |
| Navigation | Sidebar overlay | **Permanent sidebar** with icon navigation |
| Deployment | GitHub Pages | **Vercel** (primary) + GitHub Pages (mirror) |

---

## Supports 24+ Providers

<img src="https://cdn.simpleicons.org/anthropic" alt="Anthropic" width="18" /> Claude &nbsp;
<img src="https://cdn.simpleicons.org/openai" alt="OpenAI" width="18" /> OpenAI &nbsp;
<img src="https://cdn.simpleicons.org/google" alt="Google" width="18" /> Gemini &nbsp;
<img src="https://cdn.simpleicons.org/github" alt="GitHub" width="18" /> Copilot &nbsp;
<img src="https://cdn.simpleicons.org/cursor" alt="Cursor" width="18" /> Cursor &nbsp;
Codex CLI &nbsp; Windsurf &nbsp; Kiro &nbsp; JetBrains AI &nbsp; Augment &nbsp; Amp &nbsp; Warp &nbsp; Ollama &nbsp; Perplexity &nbsp; Mistral &nbsp; DeepSeek &nbsp; Meta AI &nbsp; Poe &nbsp; Runway &nbsp; Notion AI &nbsp; OpenRouter &nbsp; xAI/Grok &nbsp; z.ai &nbsp; Kimi

## Features

### Dashboard
- KPI cards with sparklines — monthly cost, total tokens, active providers, sessions today
- Provider status grid with dual quota bars (session + weekly)
- 30-day cost trend area chart (30d / 14d / 7d toggles)
- Recent entries feed

### Providers
- 24 provider cards with enable/disable toggles
- Per-provider session and weekly quota meters with color-coded thresholds
- Cost display and reset countdown timers
- Category filters (Chat, IDE, Media, Other)
- Click-to-expand detail modal with API key management

### Analytics
- Cost history area chart (daily / weekly / monthly views)
- Provider cost breakdown with horizontal bar chart
- Token usage by model
- Plan utilization meters for all enabled providers

### Calendar
- GitHub-style contribution heatmap (full year)
- 5-level color intensity based on token volume
- Click any day to see entry breakdown
- Monthly summary stats

### Settings
- Display mode: percentage / pace / both
- Theme: dark / light
- Refresh interval configuration
- Data export (JSON) and import
- Full data reset

## Tech

- **HTML + CSS + Vanilla JavaScript** — zero dependencies, no build step
- **localStorage** for persistent client-side storage
- **SVG** charts rendered dynamically (area charts, bar charts, sparklines, heatmap)
- **Glassmorphic UI** with CSS backdrop-filter, custom properties, and dark/light themes
- **Fonts:** Syne (display), Be Vietnam Pro (body), JetBrains Mono (data)

## Local Run

```bash
cd AiUsage
python3 -m http.server 5500
```

Open `http://localhost:5500`

## Files

| File | Purpose |
|---|---|
| `index.html` | App structure — 5 pages + 2 modals |
| `styles.css` | Themes, glassmorphism, responsive layout, animations |
| `script.js` | State management, 24 providers, charts, heatmap, persistence |
| `vercel.json` | Vercel deployment config |

## Inspired By

[CodexBar](https://github.com/steipete/codexbar) — a macOS menu bar utility that monitors token usage and rate limits across AI coding assistants. AiUsage brings the same concept to the web as a full dashboard experience.

---

Built by **[Himanshu Bhusari](https://himanshub15.github.io)**.
