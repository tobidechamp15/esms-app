# Ventry — Estate Visitor Management App

Built with Expo Router, NativeWind (Tailwind CSS), React Query, and Zustand.

## Setup

```bash
npm install
npx expo start
```

## Environment Variables

Copy `.env` and update:
```
EXPO_PUBLIC_API_BASE_URL=https://your-estate-api.com/api/v1
EXPO_PUBLIC_ESTATE_NAME=Your Estate Name
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Onboarding + auth screens
│   │   ├── welcome.tsx          # Landing page
│   │   ├── estate-pin.tsx       # 6-digit estate PIN
│   │   ├── phone.tsx            # Phone number entry
│   │   ├── otp.tsx              # WhatsApp OTP verification
│   │   ├── complete-profile.tsx # Name + house + street
│   │   ├── create-pin.tsx       # 4-digit PIN setup
│   │   ├── confirm-pin.tsx      # PIN confirmation
│   │   ├── login.tsx            # Phone + OTP login
│   │   ├── pin-lock.tsx         # App re-open PIN gate
│   │   └── forgot-pin.tsx       # Reset PIN with admin code
│   └── (app)/           # Main app (tab navigator)
│       ├── home/                # Dashboard
│       ├── visitors/            # Past + upcoming visits
│       ├── generate/            # Create access code
│       ├── notifications/       # Estate notifications
│       └── settings/            # Account, security, preferences
├── api/
│   ├── client.ts        # Axios instance + token refresh
│   ├── auth.ts          # Auth + estate PIN + OTP
│   ├── visits.ts        # Visit CRUD + stats
│   ├── notifications.ts # Notifications
│   └── users.ts         # Profile + concerns
├── store/
│   └── authStore.ts     # Zustand: user session + PIN
├── hooks/
│   └── useQueries.ts    # All React Query hooks
├── components/ui/
│   ├── index.tsx        # Button, PinDots, NumPad, BackHeader
│   └── Icons.tsx        # SVG icon set
├── constants/api.ts     # All endpoint URLs + storage keys
└── types/index.ts       # TypeScript interfaces
```

## Key Flows

- **Estate PIN** → validates 6-digit code before registration
- **Registration** → phone → WhatsApp OTP → profile → 4-digit PIN (device-only)
- **Login** → phone → WhatsApp OTP → device PIN check
- **Access Codes** → 5-digit numeric + QR, valid 3h from arrival
- **PIN is device-only** — never sent to the backend

## Dependencies Added vs Original

| Package | Reason |
|---------|--------|
| `@tanstack/react-query` | Server state (replaces manual Zustand fetching) |
| `nativewind` + `tailwindcss` | Tailwind CSS styling |
| `expo-clipboard` | Copy access code to clipboard |
| `expo-image-picker` | Attach photos to concern reports |
