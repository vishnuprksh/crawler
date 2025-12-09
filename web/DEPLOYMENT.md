# Web UI Deployment Guide

This guide explains how to build and deploy the Crawler web UI to connect with the VPS backend.

## Prerequisites

- Node.js 16+ and npm installed
- The backend already deployed on VPS at `http://31.97.232.229:8000`

## Local Development

The web UI will use the local backend by default:

```bash
cd web
npm install
npm run dev
```

The UI will be available at `http://localhost:3000` and connect to `http://localhost:8000`.

## Production Build

To build for production with the VPS backend configured:

```bash
cd web
npm install
npm run build
```

The build automatically uses the `.env.production` configuration which points to the VPS backend at `http://31.97.232.229:8000`.

## Deployment Options

### Option 1: Deploy to a Web Server (Recommended)

1. **Build the production bundle:**
   ```bash
   npm run build
   ```

2. **Upload to your web server:**
   ```bash
   scp -r dist/ user@your-domain.com:/var/www/html/
   ```

3. **Configure your web server (nginx example):**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     root /var/www/html;
     index index.html;
     
     location / {
       try_files $uri /index.html;
     }
   }
   ```

### Option 2: Deploy with Docker

1. **Create a Dockerfile in the `web` directory:**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create an nginx.conf file:**
   ```nginx
   server {
     listen 80;
     root /usr/share/nginx/html;
     index index.html;
     
     location / {
       try_files $uri /index.html;
     }
   }
   ```

3. **Build and run:**
   ```bash
   docker build -t crawler-web .
   docker run -d -p 80:80 --name crawler-web crawler-web
   ```

### Option 3: Deploy with Vercel (Easiest)

1. **Push your code to GitHub**

2. **Connect your GitHub repo to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Set root directory to `web`
   - Add environment variable: `VITE_BACKEND_URL=http://31.97.232.229:8000`

3. **Deploy:**
   - Click "Deploy"
   - Your app will be live at a Vercel URL

## Configuration for Different Backends

### Using Local Backend (Development)
No changes needed, defaults to `http://localhost:8000`.

### Using VPS Backend (Production)
Already configured in `.env.production` to use `http://31.97.232.229:8000`.

### Using a Custom Backend
Edit the appropriate environment file:
- `.env` for development
- `.env.production` for production

Example `.env` file:
```
VITE_BACKEND_URL=http://your-backend-url:8000
```

## Testing the Connection

1. **Open the web UI in your browser**
2. **Check the browser console (F12)** for the message: `[API Service] Using backend URL: http://31.97.232.229:8000`
3. **Navigate to the Feed tab** - it should load articles from the VPS backend

If you see connection errors:
- Verify the backend is running: `curl http://31.97.232.229:8000/`
- Check for CORS issues (you may need to configure CORS in the backend)
- Check the browser console for specific error messages

## Updating the Web UI

To deploy new changes:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Update web UI"
   git push origin main
   ```

2. **Rebuild the production bundle:**
   ```bash
   npm run build
   ```

3. **Redeploy using your chosen method above**

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_BACKEND_URL` | `http://localhost:8000` | Backend API endpoint |

This is the only environment variable needed for the web UI to function properly.
