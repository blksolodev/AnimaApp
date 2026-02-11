# ANIMA - 16-Bit RPG Anime Social Platform

A cross-platform mobile app combining Twitter/X-style social features with a 16-bit RPG "Quest Log" aesthetic for anime fans.

## Features

### Core Functionality
- **Quest Feed** - Twitter-style feed with QuestCards featuring pixel-art avatars and RPG dialogue boxes
- **Airing Today** - Real-time anime schedule with countdown timers and streaming portal links
- **Guild Chat** - Episode-specific chat rooms with "Fog of War" spoiler protection
- **Aura Search** - AI-powered mood-based anime recommendations

### Visual Style
- Integer-scaled pixel geometry (4px/8px grid)
- 32-color RPG palette (Midnight Grape, Level-Up Lime, Critical Hit Crimson)
- Dithered textures and CRT scanline overlay (3% opacity)
- Press Start 2P and Silkscreen pixel fonts

### Gamification
- Power Level system with XP progression
- Digital Inventory with anime completion stamps
- Boss Rush seasonal prediction events
- Character Pledging for profile themes

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React Native + Expo |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI/Recs | Python + Scikit-learn |
| API | AniList GraphQL |

## Project Structure

```
AnimaApp/
├── src/
│   ├── components/
│   │   ├── pixel-ui/       # Pixel art UI components
│   │   ├── social/         # QuestCard, ActionBar
│   │   └── navigation/     # PixelTabBar
│   ├── screens/
│   │   ├── feed/           # HomeScreen, AiringToday
│   │   ├── social/         # GuildChat
│   │   ├── discover/       # SearchScreen (Aura Search)
│   │   ├── profile/        # ProfileScreen
│   │   └── auth/           # Login, Register
│   ├── services/           # API and Firebase services
│   ├── store/              # Zustand state management
│   ├── theme/              # Colors, fonts, spacing, animations
│   └── types/              # TypeScript definitions
├── backend/
│   ├── python/             # AI recommendation engine
│   └── node/               # Express middleware
└── App.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Expo CLI
- Firebase project

### 1. Install React Native App Dependencies

```bash
cd AnimaApp
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your config to `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Add Pixel Fonts (Optional but recommended)

Download from Google Fonts and place in `src/assets/fonts/`:
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) - `PressStart2P-Regular.ttf`
- [Silkscreen](https://fonts.google.com/specimen/Silkscreen) - `Silkscreen-Regular.ttf`
- [VT323](https://fonts.google.com/specimen/VT323) - `VT323-Regular.ttf`

Then uncomment the font loading in `App.tsx`.

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## Backend Setup

### Python AI Recommendation Engine

```bash
cd backend/python
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python recommendation_engine.py
```

The AI service runs on `http://localhost:5000`

### Node.js Middleware

```bash
cd backend/node
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

The API runs on `http://localhost:3000`

## Firebase Security Rules

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Quests are public readable, authenticated for write
    match /quests/{questId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Guild chats - only allow write after episode airs
    match /guild_chats/{roomId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Streaming Portal Links

Supported services:
- Crunchyroll
- Netflix
- Funimation
- Hulu
- Prime Video
- HiDive

## API Endpoints

### Recommendations
- `POST /api/recommend/aura` - Mood-based search
- `GET /api/recommend/similar/:animeId` - Similar anime

### Party Matching
- `POST /api/party/match` - Find users with similar watchlists

### Boss Rush
- `GET /api/bossrush/rankings` - Current season rankings
- `POST /api/bossrush/predict` - Submit predictions

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Midnight Grape | `#1A1A2E` | Primary background |
| Deep Purple | `#16213E` | Secondary background |
| Level-Up Lime | `#00FF41` | Primary accent, success |
| Critical Hit Crimson | `#FF0043` | Danger, likes |
| Gold Coin | `#F4D03F` | Rewards, warnings |
| Mana Blue | `#4ECDC4` | Links, reposts |

## Animation Timing

- Sprite frame: ~83ms (12fps sprite animations)
- Spawn-in: 4 frames
- Heart burst: 4 frames
- Tab bounce: 2 frames
- Border draw: 8 frames (clockwise)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details
