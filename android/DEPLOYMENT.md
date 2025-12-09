# Android UI Deployment & Configuration Guide

This guide explains how to configure and deploy the Android UI to connect with the VPS backend.

## Backend Configuration

The Android app is configured to use the VPS backend at `http://31.97.232.229:8000`.

### Configuration File

The API configuration is managed in `config/api.ts`:

```typescript
export const API_BASE_URL = 'http://31.97.232.229:8000';
```

## Development Setup

### Local Development (Development Machine)

1. **Start the backend locally:**
   ```bash
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Update the API URL in `android/config/api.ts`:**
   ```typescript
   export const API_BASE_URL = 'http://localhost:8000';
   ```

3. **Run the Android app:**
   ```bash
   cd android
   npm install
   npx expo start
   ```

4. **Scan the QR code with Expo Go app on your phone**

### Device Testing (Testing on Physical Device/Emulator in Codespace)

**Option A: Use Tunnel (Recommended for Codespace)**

1. **Run Expo with tunnel mode:**
   ```bash
   cd android
   npx expo start --tunnel
   ```

2. **Scan the QR code with Expo Go app on your phone**

3. The app connects to `http://31.97.232.229:8000` via the internet

**Option B: Use Local Network (Requires device on same network)**

1. **Find the Codespace machine's IP:**
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Update `android/config/api.ts` to use that IP:**
   ```typescript
   export const API_BASE_URL = 'http://YOUR_CODESPACE_IP:8000';
   ```

3. **Run Expo in LAN mode:**
   ```bash
   cd android
   npx expo start --lan
   ```

4. **Scan the QR code with Expo Go on your device**

5. Backend must be running and accessible on that IP:
   ```bash
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Production Deployment

### Using VPS Backend

The app is already configured to use the VPS backend at `http://31.97.232.229:8000`.

#### Build for Production

**For iOS:**
```bash
cd android
npm install
eas build --platform ios
```

**For Android:**
```bash
cd android
npm install
eas build --platform android
```

**For Web (Expo Web):**
```bash
cd android
npm install
npm run web
```

#### Deploy to App Stores

**Apple App Store:**
1. Follow [Expo iOS Deployment Guide](https://docs.expo.dev/build/setup/)
2. Configure signing certificates
3. Submit to App Store Connect

**Google Play Store:**
1. Follow [Expo Android Deployment Guide](https://docs.expo.dev/build/setup/)
2. Configure keystore
3. Submit to Google Play Console

#### Deploy to Expo Hosting (Easiest)

```bash
cd android
npm install
eas update
```

This automatically deploys your app to Expo's servers, and users can access it through the Expo Go app.

## Testing the Connection

### 1. Check Backend Connectivity

After starting the app, open the browser DevTools (or check Expo console) and look for network requests to:
```
http://31.97.232.229:8000/feed
http://31.97.232.229:8000/topics
```

### 2. Verify Feed Data

The app should:
- Load the topics list without errors
- Display articles in the feed
- Allow archiving and deletion of articles

### 3. Troubleshooting Connection Issues

**Issue: "Network Error" or blank feed**
- Verify the backend is running: `curl http://31.97.232.229:8000/`
- Check firewall settings allow port 8000
- Verify `API_BASE_URL` in `android/config/api.ts` is correct

**Issue: CORS errors**
- The backend is configured with CORS enabled (`allow_origins=["*"]`)
- If you see CORS errors, check backend logs for details

**Issue: Slow or timeout errors**
- Increase the axios timeout in `android/config/api.ts`:
  ```typescript
  export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increase from 30000
  });
  ```

## Environment Variables

To make configuration more flexible, you can use environment variables:

1. **Create a `.env.local` file in the `android` directory:**
   ```
   VITE_BACKEND_URL=http://31.97.232.229:8000
   ```

2. **Update `config/api.ts` to read from environment:**
   ```typescript
   export const API_BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';
   ```

## API Endpoints

The app uses these endpoints from the backend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/topics` | GET | Fetch all topics |
| `/topics` | POST | Create a new topic |
| `/topics/{id}` | DELETE | Delete a topic |
| `/feed` | GET | Fetch articles feed |
| `/archive` | GET | Fetch archived articles |
| `/articles/{id}/archive` | POST | Archive an article |
| `/articles/{id}/swipe` | POST | Mark article as consumed |
| `/articles/{id}` | DELETE | Delete an article |
| `/generate/{topicId}` | POST | Generate article for a topic |

All endpoints are called with base URL: `http://31.97.232.229:8000`

## Updating the Backend URL

To switch backends (e.g., from VPS to local or vice versa):

1. **Edit `android/config/api.ts`:**
   ```typescript
   export const API_BASE_URL = 'YOUR_NEW_URL';
   ```

2. **If using environment variables, update `.env.local` or your deployment configuration**

3. **Rebuild and redeploy the app**

## Notes

- The app automatically handles API errors and displays user-friendly messages
- Authentication is not currently implemented; the backend is open to all
- For production deployments, consider adding authentication and HTTPS
