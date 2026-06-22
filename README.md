# 🌱 Sprout — Toddler Tracker

> An all-in-one toddler tracker that lets parents log meals, learning activities, sleep, and play — then intelligently suggests a personalized daily schedule and curriculum.

## Value Proposition

No more guessing what to teach or feed your toddler. Sprout learns from what you log and builds a routine that fits your child's actual day.

## Features

- **📊 Dashboard** — See today's activities at a glance, grouped by time of day (Morning, Midday, Afternoon, Evening). Quick-add buttons for each category.
- **➕ Quick-Log Forms** — Fast and delightful forms for each activity type:
  - **🍽️ Meals** — Preset meal times (Breakfast/Lunch/Dinner/Snack), common food chips, custom food entry, smiley rating
  - **📚 Learning** — Activity type dropdown (Reading, Puzzles, ABCs, etc.), duration slider, notes
  - **😴 Sleep** — Nap/Night toggle, start/end time picker, auto-calculated duration, quality rating
  - **🎮 Play** — Play type dropdown, Indoor/Outdoor toggle, duration slider
- **📅 Smart Schedule** — Analyzes 7 days of data to suggest a personalized daily schedule with insights on sleep patterns, favorite learning activities, meal times, and play duration
- **📱 PWA Ready** — Installable on iOS and Android home screens, works offline with service worker caching

## Tech Stack

- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS v3 (custom warm kid-friendly palette)
- **Storage:** Dexie.js (IndexedDB wrapper) — all data stays on-device
- **PWA:** Manifest, service worker, Apple touch icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
cd sprout-app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
sprout-app/
├── public/
│   ├── favicon.svg          # Sprout favicon
│   ├── icon-192.png         # PWA icon 192x192
│   ├── icon-512.png         # PWA icon 512x512
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── src/
│   ├── components/
│   │   ├── DashboardScreen.jsx  # Main dashboard with timeline
│   │   ├── LogScreen.jsx        # Tabbed logging interface
│   │   ├── ScheduleScreen.jsx   # Schedule insights & suggestions
│   │   ├── MealForm.jsx         # Meal logging form
│   │   ├── LearningForm.jsx     # Learning logging form
│   │   ├── SleepForm.jsx        # Sleep logging form
│   │   ├── PlayForm.jsx         # Play logging form
│   │   ├── ActivityCard.jsx     # Activity display card
│   │   └── DailyTimeline.jsx    # Timeline layout component
│   ├── db/
│   │   └── database.js          # Dexie.js database & helpers
│   ├── utils/
│   │   └── analyzePatterns.js   # Analytics engine
│   ├── App.jsx                  # Root app with screen switching
│   ├── index.css                # Tailwind imports & animations
│   └── main.jsx                 # Entry point
├── index.html
├── tailwind.config.js
└── package.json
```

## Category Colors

| Category  | Color  |
|-----------|--------|
| 🍽️ Meals  | Orange |
| 📚 Learning | Sky Blue |
| 😴 Sleep  | Purple |
| 🎮 Play   | Green |

## License

MIT
