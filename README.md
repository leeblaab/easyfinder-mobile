# 🇦🇪 EasyFinder UAE (Expo & React Native Mobile App)

**A high-performance, beautiful iOS and Android directory application connecting users with trusted, verified, and community-recommended local service providers — from plumbers and electricians to AC repair technicians, painters, and creative professionals across Dubai, Abu Dhabi, Sharjah, and the UAE.**

This app is fully optimized, offline-capable, and designed with Material Design 3 guidelines to deliver an exceptional mobile experience.

---

## 📋 Key Features

### 🏠 Core Directory & Advanced Search
- **8 Primary Service Categories** — Plumbers, Electricians, AC Repair, Cleaners, Movers, Painters, Pests Control, and Photography.
- **Global Search Engine** — Real-time reactive searching across providers by business names, descriptions, or service area keywords.
- **Service Area Chips** — Easily filter listings by Emirate or region (Dubai, Abu Dhabi, Sharjah, Al Ain).
- **Verified Badge System** — Prominent visual badges indicating vetted service providers.

### 👤 Simulated User & Review System
- **Secure Authentication** — JWT-based registration and secure login stored safely in encrypted storage.
- **Biometric Security** — App lock option utilizing FaceID / TouchID (using `expo-local-authentication`) to protect your personal dashboard.
- **User-Generated Reviews** — Interactive 5-star feedback form with comment text boxes.
- **Average Ratings Aggregator** — Auto-computes real-time average review scores and rating counts.

### 🛡️ UGC Policy Compliance & Reporting
- **In-App Review Reporting** — Flag reviews for policy violations (Spam, Inappropriate, Fake Review, Harassment, Other) directly inside the details page.
- **UGC Moderation Integration** — Posts reports immediately to `/items/review_reports` for automated admin review.

### ⚖️ Legal & Privacy Transparency
- **Interactive legal policies** — Dedicated Privacy Policy and Terms of Service screens.
- **Accessibility** — Easily readable, high-contrast layouts conforming to UAE Federal Decree-Law No. 45 on Personal Data Protection.

---

## 🛠️ Tech Stack & Architecture

- **Expo & React Native** — Unified multi-platform build toolchain.
- **Expo Router (v3)** — Type-safe, file-based routing architecture.
- **Zustand** — Ultra-lightweight global client-side state engine.
- **TanStack Query (React Query v5)** — Highly efficient server-state hydration, caching, and background refetching.
- **NativeWind (Tailwind CSS for React Native)** — Fluid utility-first modern visual design.
- **Axios & Directus** — Secure, automated API calls.
- **Sentry Native SDK** — High-fidelity crash reporting, diagnostic tracking, and react error boundaries.

---

## 📁 Project Folder Structure

```
easyfinder-uae-app/
├── app/                           # Expo Router File-Based Routing
│   ├── (tabs)/
│   │   ├── index.tsx              # Home / Explore categories screen
│   │   └── profile.tsx            # Personal dashboard (Submissions, Reviews, Biometrics)
│   ├── auth/
│   │   ├── login.tsx              # Sign in with email/password & Legal agreement
│   │   └── register.tsx           # Create account & terms agreement
│   ├── category/
│   │   └── [slug].tsx             # Categorized provider listings
│   ├── vendor/
│   │   └── [slug].tsx             # Detailed provider profiles with reviews and contact triggers
│   ├── legal/
│   │   ├── privacy.tsx            # UAE-compliant Privacy Policy
│   │   └── terms.tsx              # UGC Terms of Service
│   ├── search.tsx                 # Advanced reactive search screen
│   ├── submit.tsx                 # Wizard-based provider listing submission
│   └── _layout.tsx                # Sentry initializer, navigation stacks & deep link hydration
├── src/                           # Central Business Logic
│   ├── components/
│   │   └── ErrorScreen.tsx        # Fallback view for React crashes
│   ├── hooks/
│   │   ├── useVendorBySlug.ts     # Query hook for individual vendors
│   │   ├── useVendorReviews.ts    # Submit and fetch reviews with TanStack Query
│   │   ├── useMySubmissions.ts    # Fetch current user's submitted listings
│   │   └── useMyReviews.ts        # Fetch current user's submitted reviews
│   ├── services/
│   │   ├── api-client.ts          # Axios client with rate limit interception
│   │   ├── auth.service.ts        # Login, registration, and user profiles
│   │   ├── report.service.ts      # UGC reporting POST endpoint
│   │   └── file.service.ts        # Image upload handling (SecureStore header integration)
│   ├── stores/
│   │   └── useAuthStore.ts        # Zustand auth state manager
│   └── utils/
│       ├── deepLinking.ts         # Handles deep link parsing (easyfinder://vendor/[slug])
│       └── urlValidator.ts        # Ensures safe click-to-contact web intents
├── assets/                        # Adaptive icons and splash images
├── app.json                       # Expo configuration, bundle IDs, and plug-in configurations
├── eas.json                       # EAS Build release definitions
├── package.json                   # App dependencies and startup scripts
└── README.md                      # Comprehensive user guide
```

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have Node.js (v18+) and Git installed.

### 2. Install Dependencies
Clone the repository and install packages:
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=https://api.easyfinder.ae
```

### 4. Start Development Server
Launch the Expo development server:
```bash
npx expo start
```
- Press `a` to open on an Android emulator or device.
- Press `i` to open on an iOS simulator or device (requires Mac).
- Scan the QR code using the **Expo Go** application on your physical device.

---

## 🔗 Deep Linking & Navigation

EasyFinder UAE supports comprehensive deep linking using the custom scheme `easyfinder://`.

### Supported Routes
- **Vendor Detail**: `easyfinder://vendor/[vendor-slug]`
- **Category Filter**: `easyfinder://category/[category-slug]`
- **Global Search**: `easyfinder://search`
- **Add Business**: `easyfinder://submit`
- **Dashboard**: `easyfinder://profile`

### Test Deep Linking (using CLI)
To test deep links in an active development environment:
```bash
npx uri-scheme open easyfinder://vendor/plumber-dubai --android
# or
npx uri-scheme open easyfinder://vendor/plumber-dubai --ios
```

---

## 📦 EAS Build (App Store & Google Play Submission)

This project is fully pre-configured for **Expo Application Services (EAS)** for simple production cloud compilation.

### Build Preview APK (for internal testing)
```bash
eas build --profile preview --platform android
```

### Build Production Release (App Bundle `.aab` for Play Store)
```bash
eas build --profile production --platform android
```

### Build Production Release (for iOS App Store)
```bash
eas build --profile production --platform ios
```

---

## 🛡️ Performance & Security Best Practices

1. **Secure Storage** — Sensitive tokens, biometrics hashes, and access controls are fully secured using `expo-secure-store` which integrates directly with Apple Keychain and Android Keystore.
2. **Rate Limit Defenses** — Global network intercepts (via Axios) prevent brute force requests and elegantly handle HTTP 429 status codes.
3. **No Unhandled Crashes** — Integrated Sentry error boundaries prevent "silent white screens" and present users with a beautiful, friendly "Reload App" action while instantly logging diagnostics data to the developers.

---

*Made with ❤️ in the UAE*
