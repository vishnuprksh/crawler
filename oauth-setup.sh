#!/bin/bash

# Crawler - OAuth 2.0 Multi-Platform Setup Script
# This script helps you set up Google OAuth for Web, Android, and Backend

set -e

echo "========================================"
echo "  Crawler OAuth 2.0 Setup Assistant"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print sections
print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Step 1: Get Android Debug SHA-1
print_section "Step 1: Get Android Debug SHA-1"

echo -e "${YELLOW}Getting your Android debug SHA-1 fingerprint...${NC}"
SHA1_OUTPUT=$(keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -keypass android -storepass android 2>/dev/null | grep "SHA1:" || echo "")

if [ -z "$SHA1_OUTPUT" ]; then
    echo -e "${RED}Could not get SHA-1. Trying alternative method...${NC}"
    SHA1_OUTPUT=$(keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore 2>/dev/null | grep "SHA1:" || echo "")
fi

if [ -n "$SHA1_OUTPUT" ]; then
    DEBUG_SHA1=$(echo "$SHA1_OUTPUT" | awk '{print $NF}')
    echo -e "${GREEN}✓ Debug SHA-1: ${DEBUG_SHA1}${NC}"
    echo ""
    echo "This is what you'll need when creating the Android OAuth Client ID in Google Cloud Console:"
    echo -e "${GREEN}${DEBUG_SHA1}${NC}"
else
    echo -e "${RED}✗ Could not retrieve SHA-1. Please run manually:${NC}"
    echo "  keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore"
    DEBUG_SHA1=""
fi

# Step 2: Get Package Name
print_section "Step 2: Confirm Package Name"

if [ -f "android/app.json" ]; then
    PACKAGE_NAME=$(grep -A 5 '"android"' android/app.json | grep '"package"' | grep -oP '(?<="package": ")[^"]*' || echo "")
    if [ -z "$PACKAGE_NAME" ]; then
        PACKAGE_NAME="com.vishnuprksh.crawler"
    fi
    echo -e "${GREEN}✓ Package Name: ${PACKAGE_NAME}${NC}"
else
    echo -e "${YELLOW}⚠ Could not find android/app.json${NC}"
    PACKAGE_NAME="com.vishnuprksh.crawler"
fi

# Step 3: Instructions
print_section "Step 3: Google Cloud Console Setup"

echo -e "${YELLOW}Now follow these steps in Google Cloud Console:${NC}"
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create or select your project"
echo ""
echo -e "${BLUE}A. Create Web OAuth Client ID:${NC}"
echo "   - Go to: APIs & Services → Credentials"
echo "   - Click: + Create Credentials → OAuth 2.0 Client ID"
echo "   - Select: Web application"
echo "   - Name: Crawler Web Frontend"
echo "   - Authorized JavaScript origins:"
echo "     • http://localhost:5173"
echo "     • http://127.0.0.1:5173"
echo "   - Copy the Client ID"
echo ""
echo -e "${BLUE}B. Create Android OAuth Client ID (Debug):${NC}"
echo "   - Go to: APIs & Services → Credentials"
echo "   - Click: + Create Credentials → OAuth 2.0 Client ID"
echo "   - Select: Android"
echo "   - Name: Crawler Android Debug"
echo "   - Package name: ${PACKAGE_NAME}"
if [ -n "$DEBUG_SHA1" ]; then
    echo "   - SHA-1 certificate fingerprint: ${DEBUG_SHA1}"
else
    echo "   - SHA-1 certificate fingerprint: (paste from above)"
fi
echo "   - Copy the Client ID"
echo ""

# Step 4: Configuration
print_section "Step 4: Configure Your App"

echo -e "${YELLOW}Update these files with your Client IDs:${NC}"
echo ""
echo -e "${BLUE}1. Web Frontend (web/context/AuthContext.tsx):${NC}"
echo "   Line 23: const GOOGLE_CLIENT_ID = \"YOUR_WEB_CLIENT_ID_HERE\";"
echo ""
echo -e "${BLUE}2. Android App (android/context/AuthContext.tsx):${NC}"
echo "   Line 24: const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID_HERE';"
echo "   Line 27: const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID_HERE';"
echo ""

# Step 5: Backend Setup
print_section "Step 5: Backend Configuration"

echo -e "${YELLOW}Make sure your backend is configured:${NC}"
echo ""
echo "1. Check backend/.env:"
echo "   • GEMINI_API_KEY should be set"
echo "   • SECRET_KEY should be set (for JWT signing)"
echo ""
echo "2. Start backend:"
echo "   cd backend"
echo "   python main.py"
echo ""

# Step 6: Testing
print_section "Step 6: Test Your Setup"

echo -e "${YELLOW}After configuration, test each platform:${NC}"
echo ""
echo -e "${BLUE}Web App:${NC}"
echo "  cd web && npm run dev"
echo "  Visit: http://localhost:5173"
echo ""
echo -e "${BLUE}Android App:${NC}"
echo "  cd android && npm start"
echo "  Press 'a' for Android emulator"
echo ""

print_section "Setup Complete!"

echo -e "${GREEN}You're ready to go! Follow the configuration steps above.${NC}"
echo ""
echo -e "${YELLOW}Need help?${NC}"
echo "• See OAUTH_SETUP.md for detailed instructions"
echo "• See OAUTH_SETUP_CHECKLIST.md for a complete checklist"
echo ""
