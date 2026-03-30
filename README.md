# 🍸 Liquid Maestro

> **Bar · Club · Restaurant** — Downtown Los Angeles, Est. 2026

A premium, fully responsive digital experience for **Liquid Maestro** — where avant-garde mixology meets industrial elegance. Built with React + Vite and powered by a FastAPI backend with real-time WebSocket support.

---

## ✨ Features

- **Cinematic Hero Section** — Full-viewport hero with parallax mouse tracking, animated particle canvas, and a 3D tilt effect
- **Live Menu** — Menu items fetched in real-time from the backend, with WebSocket-driven instant updates when staff make changes in the Admin Portal
- **Resmio Table Reservations** — Fully integrated reservation widget for seamless online bookings
- **Events & Blog** — Dynamically managed through the SION Admin Portal, with images and rich content support
- **Contact Form** — Direct message submission to the backend with success/error states
- **Newsletter Signup** — Email capture in the footer
- **Mobile-First Responsive Design** — Fully optimized for all screen sizes with a premium slide-in mobile navigation
- **Real-Time Sync** — WebSocket connection to the backend broadcasts live menu, event, and blog updates across all connected clients

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Animations | Framer Motion |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Google Fonts — Playfair Display, Inter |
| Backend | FastAPI (Python) |
| Database | SQLite |
| Real-Time | WebSockets |
| Reservations | Resmio Widget |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- pip

### 1. Clone the repository

```bash
git clone https://github.com/InezTech/liquidmaestro.git
cd liquidmaestro
```

### 2. Start the Backend (FastAPI)

```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

The API will be live at: `http://localhost:8000`

### 3. Start the Frontend (Vite)

```bash
cd liquid-maestro
npm install
npm run dev
```

The site will be live at: `http://localhost:5173`

---

## 📁 Project Structure

```
liquid-maestro/
├── public/
│   └── assets/          # Hero images & cocktail photography
├── src/
│   ├── App.jsx          # Main application — all pages & routing
│   ├── index.css        # Full design system & responsive CSS
│   └── main.jsx         # React entry point
├── index.html           # SEO-optimized HTML shell with OG tags
├── vite.config.js
└── package.json
```

---

## 🖼️ Pages

| Route | Page |
|---|---|
| `#/` | **Home** — Hero, intro, opening hours, seasonal specials |
| `#/menu` | **Menu** — Full cocktail & bites menu, live-updated |
| `#/events` | **Events** — Curated upcoming experiences |
| `#/blog` | **The Maestro's Journal** — Articles & mixology musings |
| `#/contact` | **Contact** — Form, location, and social links |

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/menu` | Fetch all menu items |
| `POST` | `/api/menu` | Add a menu item (auth required) |
| `PUT` | `/api/menu/:id` | Update a menu item (auth required) |
| `DELETE` | `/api/menu/:id` | Delete a menu item (auth required) |
| `GET` | `/api/events` | Fetch all events |
| `GET` | `/api/blog` | Fetch all blog posts |
| `POST` | `/api/contact` | Submit contact form |
| `POST` | `/api/newsletter` | Newsletter subscription |
| `WS` | `/api/ws` | WebSocket — real-time broadcast |

---

## 🎨 Design System

The UI is built on a bespoke design system defined in `src/index.css` with:

- **Color palette**: Deep noir `#0B0B0B` base with a warm gold accent `#B8965B`
- **Typography**: Playfair Display (headings) + Inter (body)
- **Glassmorphism** cards and navigation
- **Framer Motion** page transitions and scroll-triggered animations
- **CSS custom properties** for consistent theming throughout

---

## 📱 Mobile

- Full mobile navigation with a slide-in overlay menu
- 48×48px touch targets meeting WCAG accessibility standards
- Responsive typography scaling via `clamp()`
- Optimized layouts for all breakpoints: 480px / 900px

---

## 📄 License

© 2026 Liquid Maestro. All rights reserved.

---

<div align="center">
  <em>Crafted with precision — for an experience as refined as the cocktails.</em>
</div>
