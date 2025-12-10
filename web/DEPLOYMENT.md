# Frontend Setup Guide

This guide will help you set up and deploy the web frontend for the Crawler project on a VPS and verify that it is working correctly.

## Prerequisites

- Node.js (v18 or higher) and npm installed on your machine or VPS
- Backend API server running (see backend deployment guide)
- A domain name or VPS IP address

## Deployment with Docker (Recommended)

### Step 1: Build the Docker Image
Navigate to the `web` directory and run:
```bash
docker build -t crawler-frontend .
```

### Step 2: Run the Container
Run the container, mapping port 80 (or 3000 for development):
```bash
docker run -d \
  -p 80:3000 \
  -e VITE_API_URL=http://your-backend-ip:8000 \
  --name crawler-frontend \
  crawler-frontend
```

### Step 3: Verify Deployment
Check if the container is running:
```bash
docker ps
```

You can also view logs:
```bash
docker logs -f crawler-frontend
```

## Alternative: Manual Setup on VPS

### Step 1: Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Update System Packages
```bash
apt update && apt upgrade -y
```

### Step 3: Install Node.js and Required Tools
```bash
apt install -y nodejs npm git curl
```

Verify installation:
```bash
node --version
npm --version
```

### Step 4: Clone or Upload Your Project
If using Git:
```bash
git clone <your-repo-url> crawler
cd crawler/web
```

Or if uploading via SCP:
```bash
scp -r /path/to/crawler root@your-vps-ip:/root/
cd /root/crawler/web
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Configure Environment Variables
Create a `.env.production` file with your API URL:
```bash
nano .env.production
```

Add the following line (replace with your actual backend URL):
```
VITE_API_URL=http://your-backend-ip:8000
```

Press `Ctrl+O`, then `Enter` to save, and `Ctrl+X` to exit nano.

### Step 7: Build the Frontend
```bash
npm run build
```

This creates a production-ready build in the `dist/` directory.

### Step 8: Install a Web Server (Nginx)
```bash
apt install -y nginx
```

### Step 9: Configure Nginx
Create an Nginx configuration file:
```bash
nano /etc/nginx/sites-available/crawler
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP address

    # Redirect HTTP to HTTPS (optional, if using SSL)
    # return 301 https://$server_name$request_uri;

    root /root/crawler/web/dist;
    index index.html;

    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Single Page Application routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://your-backend-ip:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/crawler /etc/nginx/sites-enabled/
```

Test the Nginx configuration:
```bash
nginx -t
```

Start Nginx:
```bash
systemctl start nginx
systemctl enable nginx
```

### Step 10: Verify Deployment
The frontend should now be accessible at `http://your-domain.com` or `http://your-vps-ip`.

## Setting Up SSL/HTTPS (Optional but Recommended)

### Using Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate:**
   ```bash
   certbot certonly --nginx -d your-domain.com
   ```

3. **Update Nginx Configuration:**
   Edit `/etc/nginx/sites-available/crawler` and add:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # ... rest of configuration from Step 9 ...
   }

   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

4. **Reload Nginx:**
   ```bash
   systemctl reload nginx
   ```

5. **Auto-Renewal:**
   Certbot automatically sets up renewal. Test it:
   ```bash
   certbot renew --dry-run
   ```

## Updating the Frontend After Repository Changes

### Option 1: Update with Docker (Recommended)

If you're using Docker, the process is simple:

1. **SSH into your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Navigate to the repository:**
   ```bash
   cd /root/crawler
   ```

3. **Pull the latest changes from Git:**
   ```bash
   git pull origin main
   ```

4. **Stop the old container:**
   ```bash
   docker stop crawler-frontend
   docker rm crawler-frontend
   ```

5. **Rebuild the Docker image:**
   ```bash
   docker build -t crawler-frontend:latest .
   ```

6. **Run the new container:**
   ```bash
   docker run -d \
     -p 80:3000 \
     -e VITE_API_URL=http://your-backend-ip:8000 \
     --name crawler-frontend \
     crawler-frontend:latest
   ```

7. **Verify the new deployment:**
   ```bash
   docker logs -f crawler-frontend
   ```

### Option 2: Update with Manual Setup

If using manual setup with Nginx:

1. **SSH into your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Navigate to the web directory:**
   ```bash
   cd /root/crawler/web
   ```

3. **Pull the latest changes:**
   ```bash
   cd /root/crawler
   git pull origin main
   cd /root/crawler/web
   ```

4. **Install/update dependencies (if package.json changed):**
   ```bash
   npm install
   ```

5. **Update environment variables if needed:**
   ```bash
   nano .env.production
   ```

6. **Rebuild the frontend:**
   ```bash
   npm run build
   ```

7. **Reload Nginx:**
   ```bash
   systemctl reload nginx
   ```

### Option 3: Zero-Downtime Update with Docker

For production environments where you cannot afford downtime:

1. **SSH into your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Pull latest changes:**
   ```bash
   cd /root/crawler && git pull origin main
   ```

3. **Build the new image with a new tag:**
   ```bash
   docker build -t crawler-frontend:v2 .
   ```

4. **Run the new container on a different port temporarily:**
   ```bash
   docker run -d \
     -p 3001:3000 \
     -e VITE_API_URL=http://your-backend-ip:8000 \
     --name crawler-frontend-v2 \
     crawler-frontend:v2
   ```

5. **Test the new container:**
   ```bash
   curl http://your-vps-ip:3001
   ```

6. **Update Nginx to point to the new port:**
   Edit `/etc/nginx/sites-available/crawler` and change:
   ```nginx
   location / {
       proxy_pass http://localhost:3001;
   }
   ```

7. **Reload Nginx:**
   ```bash
   systemctl reload nginx
   ```

8. **Stop the old container:**
   ```bash
   docker stop crawler-frontend
   docker rm crawler-frontend
   ```

9. **Rename and run the new container on the main port:**
   ```bash
   docker stop crawler-frontend-v2
   docker rename crawler-frontend-v2 crawler-frontend
   docker run -d \
     -p 3000:3000 \
     -e VITE_API_URL=http://your-backend-ip:8000 \
     --name crawler-frontend \
     crawler-frontend:latest
   ```

## Testing the Frontend

### Method 1: Browser Access
Simply open your browser and navigate to:
- `http://your-domain.com` (or `http://your-vps-ip`)

The frontend should load and display the application interface.

### Method 2: Using cURL (From Your Local Machine)

1. **Check Server Response:**
   ```bash
   curl http://your-vps-ip/
   ```
   *Expected:* HTML content of the frontend application

2. **Test API Connectivity:**
   Open browser console and check if API requests are working. Look for successful responses in the Network tab.

## Troubleshooting

### Port 80 is not accessible from outside
Open the port in your firewall:
```bash
ufw allow 80
ufw allow 443
```

### Nginx configuration error
Test the configuration:
```bash
nginx -t
```

Reload Nginx:
```bash
systemctl reload nginx
```

### Check Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### API requests failing
1. Verify backend is running and accessible
2. Check environment variable `VITE_API_URL` in `.env.production`
3. Ensure CORS is properly configured on the backend

### Restart Nginx
```bash
systemctl restart nginx
```

### Clear browser cache
If you see old content, clear your browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

## Performance Optimization

### Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json application/javascript application/xml+rss;
gzip_min_length 1000;
```

### Enable HTTP/2
Already configured in the SSL section above.

### Set appropriate cache headers
Already configured in the static files location block.

## Production Checklist

- [ ] Backend API is deployed and running
- [ ] Environment variables are correctly set
- [ ] SSL/HTTPS is configured
- [ ] Domain name is pointing to VPS IP
- [ ] Firewall allows ports 80 and 443
- [ ] Frontend builds successfully without errors
- [ ] API requests from frontend work correctly
- [ ] Monitoring/logging is set up
- [ ] Auto-renewal of SSL certificate is configured
- [ ] Backup strategy is in place
