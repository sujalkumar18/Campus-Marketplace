# Building APK for CampusRent Mobile App

## Step 1: Update API URL

Edit `mobile/lib/queryClient.ts` and replace:
```typescript
const BASE_URL = 'https://YOUR_RENDER_URL.onrender.com';
```

With your actual Render backend URL (example: `https://campusrent-api.onrender.com`).

### Getting Your Render URL:
1. Deploy your backend to Render (see `RENDER_DEPLOYMENT.md`)
2. After deployment, Render will give you a URL like: `https://your-app-name.onrender.com`
3. Use that URL in the mobile app

## Step 2: Install Dependencies

In the `mobile/` directory, run:
```bash
npm install
```

If you get React version conflicts, you can use:
```bash
npm install --legacy-peer-deps
```

## Step 3: Build APK

### Option A: Using EAS (Recommended - Easiest)

This builds in the cloud without needing local Android SDK setup.

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo account (create one if you don't have):
```bash
eas login
```

3. Build APK:
```bash
cd mobile
eas build --platform android --local
```

The APK will be generated and ready to download.

### Option B: Using Local Android SDK

1. Make sure you have Android SDK installed
2. Run:
```bash
cd mobile
npx react-native build-android
```

3. APK will be in `android/app/build/outputs/apk/`

### Option C: Using Expo CLI (Development APK)

For testing:
```bash
cd mobile
npm start
```

Then press `a` to build and install on Android emulator, or use:
```bash
eas build --platform android
```

## Step 4: Share APK with Students

Once the APK is built:
1. Share the `.apk` file with your students
2. They can install it on their Android phones by downloading the file and tapping to install
3. They may need to enable "Unknown Sources" in their phone's security settings

## Troubleshooting

### React version mismatch
Use `--legacy-peer-deps` flag when installing:
```bash
npm install --legacy-peer-deps
```

### API connection fails
- Make sure the `BASE_URL` in `lib/queryClient.ts` is correct
- Check that your Replit backend is running
- The URL should be your public Replit domain with `:5000` port

### Build fails
- Clear cache: `npm install --legacy-peer-deps && npm cache clean --force`
- Make sure you're in the `mobile/` directory when running commands
- Check that you have Node.js 18+ installed: `node --version`

## Testing the App

Before building APK, test in Expo:
```bash
cd mobile
npm start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on real phone

The app connects to your backend API, so make sure your Express server is running!
