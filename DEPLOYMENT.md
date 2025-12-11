# VPS Deployment Guide for Crawler App

This guide covers deploying both the backend (Python/FastAPI) and web frontend (React/Vite) to the same VPS. The backend is assumed to be already deployed. We recommend Docker for consistency and ease of updates, with manual alternatives provided. Assumes nginx-proxy is running on port 80 for reverse proxying and SSL.

## Prerequisites
- VPS with Ubuntu/Debian (e.g., IP: 31.97.232.229).
- SSH access to VPS.
- Docker installed (`sudo apt update && sudo apt install docker.io`).
- Git for cloning/updating code.
- Domain: crawler.vishnuprakash.in (DNS pointing to VPS IP).
- nginx-proxy running: `docker network create nginx-proxy && docker run -d -p 80:80 -p 443:443 --name nginx-proxy --network nginx-proxy -v /var/run/docker.sock:/tmp/docker.sock:ro -v nginx-proxy_certs:/etc/nginx/certs jwilder/nginx-proxy`.
- letsencrypt-nginx-proxy-companion for SSL: `docker run -d --name nginx-proxy-letsencrypt --network nginx-proxy -v /var/run/docker.sock:/var/run/docker.sock:ro -v nginx-proxy_certs:/etc/nginx/certs:rw --volumes-from nginx-proxy jrcs/letsencrypt-nginx-proxy-companion`.
- For backend: Google Gemini API key.
- For web: Backend API URL (e.g., `http://crawler-backend:8000` via Docker network).

## Initial Setup

### 1. Backend Deployment (Already Done)
If not yet deployed, follow these steps:

#### Docker (Recommended)
1. SSH to VPS: `ssh root@31.97.232.229`.
2. Clone repo: `git clone https://github.com/vishnuprksh/crawler.git && cd crawler/backend`.
3. Build image: `docker build -t crawler-backend .`.
4. Run container: `docker run -d --network nginx-proxy -e GEMINI_API_KEY=<your-key> --name crawler-backend crawler-backend`.
5. Verify: `docker ps` and `curl http://crawler-backend:8000/docs` (from another container on network).

#### Manual Alternative
1. SSH to VPS.
2. Install Python: `sudo apt install python3.11 python3-pip python3-venv`.
3. Clone/upload to `/root/crawler/backend`.
4. Create venv: `python3 -m venv venv && source venv/bin/activate`.
5. Install deps: `pip install -r requirements.txt`.
6. Set env: `export GEMINI_API_KEY=<your-key>`.
7. Run: `uvicorn main:app --host 0.0.0.0 --port 8000`.
8. For production, configure supervisor: Add `/etc/supervisor/conf.d/crawler.conf` with program config, then `supervisorctl reread && supervisorctl update`.
   Note: Since nginx-proxy uses port 80, backend remains on 8000 for internal access.

### 2. Web Frontend Deployment

#### Docker (Recommended)
1. SSH to VPS (same session or new).
2. Navigate to web: `cd ../web`.
3. Build image: `docker build -t crawler-frontend .`.
4. Run container: `docker run -d --network nginx-proxy -e VIRTUAL_HOST=crawler.vishnuprakash.in -e LETSENCRYPT_HOST=crawler.vishnuprakash.in -e LETSENCRYPT_EMAIL=your@email.com -e VITE_API_URL=http://crawler-backend:8000 --name crawler-frontend crawler-frontend`.
5. Verify: `docker ps` and visit https://crawler.vishnuprakash.in.

#### Manual Alternative
Note: With nginx-proxy on port 80, manual deployment is not straightforward. Use a different port (e.g., 8080) and configure nginx-proxy to proxy crawler.vishnuprakash.in to localhost:8080. Docker is recommended for simplicity.

1. SSH to VPS.
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`.
3. Clone/upload to `/root/crawler/web`.
4. Install deps: `npm install`.
5. Set env: `echo "VITE_API_URL=http://localhost:8000" > .env.production`.
6. Build: `npm run build`.
7. Run on port 8080: `npx serve -s dist -l 8080` (or use pm2 for production).
9. Configure nginx-proxy: Add labels or env vars to proxy container, but this is complex; prefer Docker.

## Updates

### Backend Updates
#### Docker
1. SSH: `cd /root/crawler/backend`.
2. Pull changes: `git pull origin main`.
3. Stop old: `docker stop crawler-backend && docker rm crawler-backend`.
4. Rebuild: `docker build -t crawler-backend .`.
5. Run new: `docker run -d --network nginx-proxy -e GEMINI_API_KEY=<key> --name crawler-backend crawler-backend`.

#### Manual
1. SSH: `cd /root/crawler/backend`.
2. Pull: `git pull origin main`.
3. Update deps if needed: `source venv/bin/activate && pip install -r requirements.txt`.
4. Restart: `supervisorctl restart crawler`.

### Web Frontend Updates
#### Docker
1. SSH: `cd /root/crawler/web`.
2. Pull: `git pull origin main`.
3. Stop old: `docker stop crawler-frontend && docker rm crawler-frontend`.
4. Rebuild: `docker build -t crawler-frontend .`.
5. Run new: `docker run -d --network nginx-proxy -e VIRTUAL_HOST=crawler.vishnuprakash.in -e LETSENCRYPT_HOST=crawler.vishnuprakash.in -e LETSENCRYPT_EMAIL=your@email.com -e VITE_API_URL=http://crawler-backend:8000 --name crawler-frontend crawler-frontend`.

#### Manual
1. SSH: `cd /root/crawler/web`.
2. Pull: `git pull origin main`.
3. Update deps if needed: `npm install`.
4. Rebuild: `npm run build`.
5. Reload nginx: `sudo systemctl reload nginx`.

### Zero-Downtime Updates (Docker)
- For backend: Build new image (e.g., `crawler-backend:v2`), run with --network nginx-proxy --name crawler-backend-new, test via network, rename containers, stop old.
- For web: Build new, run with --network nginx-proxy -e VIRTUAL_HOST=crawler.vishnuprakash.in ... --name crawler-frontend-new, test domain, stop old.

## Shared Notes
- **Firewall**: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.
- **Logs**: Backend: `docker logs crawler-backend`. Web: `docker logs crawler-frontend`. Nginx-proxy: `docker logs nginx-proxy`.
- **Troubleshooting**: Check containers with `docker ps`, test API with `docker exec -it crawler-backend curl http://localhost:8000/`, web with browser at https://crawler.vishnuprakash.in.
- **Security**: Use non-root user for Docker, rotate API keys, nginx-proxy handles HTTPS.
- **Monitoring**: Consider adding health checks or monitoring tools.</content>
<parameter name="filePath">/workspaces/crawler/DEPLOYMENT.md