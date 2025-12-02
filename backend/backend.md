# Backend Setup Guide

This guide will help you set up the Python backend server for the Crawler project on a VPS and verify that it is working correctly.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))
- SSH access to your VPS

## Setup Instructions on VPS

### Step 1: Connect to Your VPS
```bash
ssh root@31.97.232.229
```

### Step 2: Update System Packages
```bash
apt update && apt upgrade -y
```

### Step 3: Install Python and Required Tools
```bash
apt install -y python3 python3-pip python3-venv git
```

### Step 4: Clone or Upload Your Project
If using Git:
```bash
git clone <your-repo-url> crawler
cd crawler/backend
```

Or if uploading via SCP:
```bash
scp -r /path/to/crawler root@31.97.232.229:/root/
cd /root/crawler/backend
```

### Step 5: Create a Virtual Environment
```bash
python3 -m venv .venv
```

### Step 6: Activate the Virtual Environment
```bash
source .venv/bin/activate
```

### Step 7: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 8: Configure Environment Variables
Create a `.env` file with your Gemini API key:
```bash
nano .env
```

Add the following line:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Press `Ctrl+O`, then `Enter` to save, and `Ctrl+X` to exit nano.

### Step 9: Run the Server (For Testing)
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server should now be accessible at `http://31.97.232.229:8000`.

### Step 10: Run as Background Service (Recommended for Production)

Install supervisor to manage the application:
```bash
apt install -y supervisor
```

Create a supervisor configuration file:
```bash
nano /etc/supervisor/conf.d/crawler.conf
```

Add the following configuration:
```ini
[program:crawler]
directory=/root/crawler/backend
command=/root/crawler/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
autostart=true
autorestart=true
stderr_logfile=/var/log/crawler.err.log
stdout_logfile=/var/log/crawler.out.log
user=root
```

Start the service:
```bash
supervisorctl reread
supervisorctl update
supervisorctl start crawler
```

Check status:
```bash
supervisorctl status crawler
```

## Testing the Backend

### Method 1: Automatic Documentation (Swagger UI)
Open your browser and navigate to:
[http://31.97.232.229:8000/docs](http://31.97.232.229:8000/docs)

This interface allows you to interactively test all available endpoints.

### Method 2: Using cURL (From Your Local Machine)

1.  **Check Server Status:**
    ```bash
    curl http://31.97.232.229:8000/
    ```
    *Expected Output:* `{"message": "Crawler Backend API"}`

2.  **Create a Topic:**
    ```bash
    curl -X POST "http://31.97.232.229:8000/topics" \
         -H "Content-Type: application/json" \
         -d '{"id": "tech", "query": "Artificial Intelligence", "icon": "🤖"}'
    ```

3.  **List Topics:**
    ```bash
    curl http://31.97.232.229:8000/topics
    ```

4.  **Generate an Article (Requires valid API Key):**
    ```bash
    curl -X POST "http://31.97.232.229:8000/generate/tech"
    ```

5.  **Get Feed:**
    ```bash
    curl http://31.97.232.229:8000/feed
    ```

## Troubleshooting

### Port 8000 is not accessible from outside
You may need to open the port in your firewall:
```bash
ufw allow 8000
```

### Check Logs (If using supervisor)
```bash
tail -f /var/log/crawler.out.log
tail -f /var/log/crawler.err.log
```

### Restart the Service
```bash
supervisorctl restart crawler
```

### Stop the Service
```bash
supervisorctl stop crawler
```
