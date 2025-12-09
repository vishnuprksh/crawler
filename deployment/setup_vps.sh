#!/bin/bash
set -e

# Configuration
VPS_USER="root"
VPS_HOST="31.97.232.229"
REPO_DIR="/var/repo/crawler.git"
HOOK_SOURCE="deployment/post-receive"
HOOK_DEST="$REPO_DIR/hooks/post-receive"

echo "Setting up deployment on $VPS_HOST..."

# 1. Create bare repository
echo "Creating bare repository at $REPO_DIR..."
ssh $VPS_USER@$VPS_HOST "mkdir -p $REPO_DIR && cd $REPO_DIR && git init --bare"

# 2. Upload post-receive hook
echo "Uploading post-receive hook..."
scp $HOOK_SOURCE $VPS_USER@$VPS_HOST:$HOOK_DEST

# 3. Make hook executable
echo "Making hook executable..."
ssh $VPS_USER@$VPS_HOST "chmod +x $HOOK_DEST"

echo "VPS setup complete!"
echo "Now run: git remote add deploy ssh://$VPS_USER@$VPS_HOST$REPO_DIR"
