# 🇮🇳 Seva Sansaar — सेवा संसार

### *Har Seva, Har Gali, Digital India*

> A government-aligned hyperlocal city services and business discovery platform built for Bharat's Tier 2/3 cities.

[![Digital India](https://img.shields.io/badge/Digital%20India-Partner-FF9933?style=for-the-badge)](https://digitalindia.gov.in)
[![Vocal for Local](https://img.shields.io/badge/Vocal%20for-Local-138808?style=for-the-badge)](https://www.makeinindia.com)
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-000080?style=for-the-badge)]()
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## 📌 The Problem

India has **10 crore+ local businesses** — electricians, tutors, repair shops, cafes, tailors — but **90% of them are invisible online.**

Residents of Tier 2/3 cities like Patna, Ranchi, and Jamshedpur struggle every day:
- "Kahan se achha electrician milega?"
- "Mere bachhe ke liye tutor kahan dhundhu?"
- "Is area mein koi good cafe hai?"

Information is scattered across WhatsApp groups, social media pages, and word-of-mouth. There is no single trusted platform for local service discovery in Bharat.

---

## 💡 Our Solution — Seva Sansaar

**Seva Sansaar** is a hyperlocal city services and business discovery platform — India ka apna, Digital India ka local engine.

A centralized digital platform where:
- 🔍 **Citizens** can discover nearby verified services instantly
- 🏪 **Local businesses** can list themselves and reach thousands of customers
- ✅ **Trust** is ensured through government-aligned verification badges
- 🗣️ **Language barrier** is eliminated with Hindi-first UI

---

## 🏛️ Government Alignment

Seva Sansaar is built in direct alignment with India's national digital vision:

| Scheme | How We Align |
|---|---|
| 🇮🇳 **Digital India** | Bringing local businesses online, digitizing discovery |
| 🛒 **Vocal for Local** | Giving visibility to local businesses over big platforms |
| 🔨 **PM Vishwakarma Yojana** | Special verified badges for skilled tradespeople |
| 🏙️ **Smart Cities Mission** | Centralizing city service data for better urban access |
| 🚀 **Startup India** | A startup solving a grassroots problem at scale |
| 🔗 **ONDC** | Open network philosophy — local services for all |

---

## ✨ Key Features

### For Citizens
- 🔍 **Smart Search** — Search by service type and location
- 📂 **Category Browse** — Electrician, Tutor, Cafe, Repair, Salon, Grocery & more
- ⭐ **Reviews & Ratings** — Real community reviews from verified users
- 📍 **Nearby Discovery** — Location-aware results with map view
- 📞 **Direct Contact** — WhatsApp and call buttons on every listing
- 🗣️ **Hindi + English** — Toggle between languages seamlessly

### For Businesses
- 📝 **Free Listing** — Any local business can list for free
- ✅ **Govt Verified Badge** — MSME/Udyam registered businesses get verified
- 🔨 **PM Vishwakarma Badge** — Special badge for skilled tradespeople
- 📊 **Visibility Dashboard** — See how many people viewed your listing
- ⬆️ **Featured Listing** — Premium placement for more reach

---

## 🛠️ Tech Stack

```
Frontend     →  Next.js 14 (App Router)
Styling      →  Tailwind CSS
Language     →  TypeScript
Database     →  Firebase Firestore
Auth         →  Firebase Authentication
Maps         →  Google Maps API
Icons        →  Lucide React
Fonts        →  Noto Sans Devanagari (Hindi support)
Deployment   →  Vercel
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/mohitraj8503/seva-sansaar.git

# Navigate to project
cd seva-sansaar

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
seva-sansaar/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── khojo/                # Search & Browse
│   │   ├── business/
│   │   │   └── [id]/             # Business Detail Page
│   │   ├── list-karo/            # Business Registration Form
│   │   └── api/                  # API Routes
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── BusinessCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── GovtSchemesBanner.tsx
│   │   ├── StatsSection.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── firebase.ts           # Firebase config
│   │   └── data.ts               # Demo data
│   └── types/
│       └── index.ts              # TypeScript types
├── public/
│   └── logo.png                  # Seva Sansaar logo
├── .env.example
├── .env.local
└── README.md
```

---

## 🗺️ Pages

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | Hero, categories, featured businesses |
| `/khojo` | Search | Browse and filter all services |
| `/business/[id]` | Business Detail | Full info, reviews, contact |
| `/list-karo` | List Business | Register your local business |
| `/dashboard` | Admin Panel | Manage listings (govt style UI) |

---

## 🎨 Design System

```
Primary Saffron   →  #FF9933  (CTAs, highlights)
India Green       →  #138808  (Verified, success states)
Navy Blue         →  #000080  (Headers, trust elements)
White             →  #FFFFFF  (Backgrounds, cards)
Dark Navy         →  #0A1628  (Hero section, footer)
```

Typography: **Noto Sans Devanagari** for Hindi, **Inter** for English

---

## 📊 Business Categories

| Category | Hindi | Icon |
|---|---|---|
| Electrician | बिजली मिस्त्री | ⚡ |
| Plumber | प्लंबर | 🔧 |
| AC Repair | AC मरम्मत | ❄️ |
| Carpenter | बढ़ई | 🪚 |
| Tutor | शिक्षक | 📚 |
| Coaching | कोचिंग | 🎓 |
| Salon | सैलून | ✂️ |
| Cafe | कैफे | ☕ |
| Restaurant | रेस्तरां | 🍽️ |
| Grocery | किराना | 🛒 |
| Medical | मेडिकल | 💊 |
| Tailor | दर्जी | 🧵 |

---

## 🌆 Cities Covered

Currently available in:
- Patna, Bihar
- Ranchi, Jharkhand
- Jamshedpur, Jharkhand
- Dhanbad, Jharkhand

*Expanding to 100 cities by 2027*

---

## 💰 Revenue Model

| Stream | Details |
|---|---|
| **Freemium Listing** | Basic free, Premium ₹499/month |
| **Featured Placement** | Top of search results ₹999/month |
| **Lead Generation** | ₹10–20 per customer lead |
| **Govt Partnership** | Integration with PM Vishwakarma portal |

---

## 🏆 Built At

**HackHorizon 2K26** — 24-hour Hackathon
Organized by Arka Jain University in collaboration with IBM & Google Developer Groups

---

## 👥 Team Seva Sansaar

| Member | Role |
|---|---|
| **Mohit Raj** | Team Lead & Full Stack Developer |
| **Surjo** | Brand Design & Visual Identity |
| **Rishika** | Government Research & Trust Framework |
| **Janvi** | Business Model & Market Research |
| **Tanya** | Competitor Analysis & USP Strategy |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Digital India Mission](https://digitalindia.gov.in)
- [PM Vishwakarma Yojana](https://pmvishwakarma.gov.in)
- [Smart Cities Mission](https://smartcities.gov.in)
- [ONDC](https://ondc.org)

---

<div align="center">

**Seva Sansaar — सेवा संसार**

*Har Seva, Har Gali, Digital India* 🇮🇳

Made with ❤️ in India | © 2025 Seva Sansaar

[![Digital India](https://img.shields.io/badge/Digital%20India-FF9933?style=flat-square)](https://digitalindia.gov.in)
[![Vocal for Local](https://img.shields.io/badge/Vocal%20for%20Local-138808?style=flat-square)]()
[![Smart Cities](https://img.shields.io/badge/Smart%20Cities-000080?style=flat-square)]()

</div>
