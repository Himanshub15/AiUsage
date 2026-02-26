# AiUsage

AiUsage is a clean, interactive web app to track AI usage across providers, accounts, and daily activity.

## What It Does

- Track daily AI usage with a clickable Home calendar.
- Add usage entries by provider/account with prompts and minutes.
- Maintain usage stats (month/year usage days, total prompts, total minutes, entries).
- Manage AI account integration state for OpenAI and Claude.
- View sample usage trend analytics on the AI Account page.
- Navigate usage calendars in multiple views:
  - Week view
  - Month overview (3 months per row, scrollable)
  - Year view (12-month compact frame)
- See daily usage activity bars under the Usage Calendar.
- Toggle dark/light theme.
- Open/close sidebar navigation from hamburger menu, including outside-click close.
- Use a login UI modal (Email, Google, Apple, Passkey placeholders).
- Persistent state using `localStorage`.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- No framework/build tool required

## Project Structure

- `index.html` - layout and UI sections
- `styles.css` - theme, layout, responsive styling
- `script.js` - interactions, state, rendering logic

## Run Locally

From the project folder:

```bash
cd "/Users/himanshubhusari/Desktop/AiUsage"
python3 -m http.server 5500
```

Open:

- `http://localhost:5500`

## Main Screens

1. Home
- Hero + summary stats cards
- Big clickable month calendar
- Horizontal moving supported AI provider band

2. AI Account
- Connect/Disconnect OpenAI and Claude keys (UI flow)
- Remove key option (trash action)
- Sample line chart with range filters: 30 days / 10 days / last week

3. Usage Calendar
- Week / Month / Year calendar modes
- Navigation for period changes
- Minimal daily usage bar chart
- Usage stats
- Manual usage entry form + list

4. About Us
- Interactive tabs (Mission / Builder / Vision)

## Data Persistence

App data is stored in browser `localStorage`.

- Theme preference
- Usage days
- Usage entries
- Provider connection state

## GitHub Pages Deployment

This project is static, so it works directly on GitHub Pages.

### Option A: Project Site

Deploy at:

- `https://<your-username>.github.io/<repo-name>/`

### Option B: User Site

Use repo name exactly `<your-username>.github.io` to deploy at root:

- `https://<your-username>.github.io/`

## Future Enhancements

- Real provider API integrations
- Auth backend integration
- Provider-wise analytics and filters
- Export/share reports
- Team collaboration

