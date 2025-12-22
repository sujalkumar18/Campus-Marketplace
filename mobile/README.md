# CampusRent Mobile App

React Native/Expo mobile app for the CampusRent marketplace.

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Update the API URL in `lib/queryClient.ts`:
Replace `http://YOUR_REPLIT_URL:5000` with your actual Replit backend URL.

## Running the App

### Development
```bash
npm start
```

This will start the Expo development server. You can then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your phone

### Building APK

For Android:
```bash
eas build --platform android
```

Or use local build:
```bash
npx react-native build-android
```

### Building for iOS
```bash
eas build --platform ios
```

## Project Structure

- `App.tsx` - Main app component with navigation setup
- `screens/` - App screens (Home, Sell, Chats, Profile, etc.)
- `lib/` - Utility functions and API client
- `app.json` - Expo configuration

## Features

- Browse campus marketplace listings
- Search and filter by category
- Create new listings
- Chat with buyers/sellers
- User profile and authentication
- Real-time messaging

## Backend API

Make sure your Express backend is running on the configured URL. The mobile app will connect to:
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - Get messages
- `POST /api/chats/:id/messages` - Send message
