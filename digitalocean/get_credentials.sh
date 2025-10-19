#!/bin/bash
#
# get_credentials.sh - Interactive helper to get DigitalOcean credentials
#
# Usage:
#   ./get_credentials.sh
#

set -euo pipefail

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║         DigitalOcean Credentials Helper - Interactive Setup               ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# STEP 1: Get API Token
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Get Your API Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open this URL in your browser:"
echo "   👉 https://cloud.digitalocean.com/account/api/tokens"
echo ""
echo "2. Click 'Generate New Token'"
echo "3. Name: 'CLI Access' (or anything you like)"
echo "4. Scopes: Check both 'Read' and 'Write'"
echo "5. Copy the token (starts with 'dop_v1_...')"
echo ""
echo -n "Paste your token here (or press Enter to skip): "
read -r TOKEN
echo ""

if [[ -z "$TOKEN" ]]; then
    echo "⚠️  Skipped token entry. You'll need to set it manually later."
    echo ""
else
    echo "✓ Token received (${#TOKEN} characters)"
    echo ""
    
    # Test the token
    echo "Testing token..."
    TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        -H "Authorization: Bearer ${TOKEN}" \
        "https://api.digitalocean.com/v2/account" 2>&1 || echo -e "\n000")
    
    HTTP_CODE=$(echo "${TEST_RESPONSE}" | tail -n1)
    RESPONSE_BODY=$(echo "${TEST_RESPONSE}" | sed '$d')
    
    if [[ "${HTTP_CODE}" == "200" ]]; then
        ACCOUNT_EMAIL=$(echo "${RESPONSE_BODY}" | jq -r '.account.email // "unknown"')
        echo "✅ Token is valid!"
        echo "   Account: ${ACCOUNT_EMAIL}"
        echo ""
    else
        echo "❌ Token test failed (HTTP ${HTTP_CODE})"
        echo "   Please check your token and try again."
        echo ""
        exit 1
    fi
fi

# ============================================================================
# STEP 2: Get SSH Key ID
# ============================================================================

if [[ -n "$TOKEN" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 2: Get Your SSH Key ID"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Fetching your SSH keys from DigitalOcean..."
    
    SSH_RESPONSE=$(curl -s -X GET \
        -H "Authorization: Bearer ${TOKEN}" \
        "https://api.digitalocean.com/v2/account/keys" 2>&1)
    
    KEY_COUNT=$(echo "${SSH_RESPONSE}" | jq '.ssh_keys | length')
    
    if [[ "${KEY_COUNT}" -gt 0 ]]; then
        echo "✅ Found ${KEY_COUNT} SSH key(s):"
        echo ""
        echo "${SSH_RESPONSE}" | jq -r '.ssh_keys[] | "  ID: \(.id) - \(.name)"'
        echo ""
        echo "Copy one of the ID numbers above to use as DO_SSH_KEY_ID"
        echo ""
    else
        echo "⚠️  No SSH keys found in your DigitalOcean account."
        echo ""
        echo "Do you want to upload your local SSH key now? (y/n)"
        read -r UPLOAD_KEY
        
        if [[ "$UPLOAD_KEY" =~ ^[Yy]$ ]]; then
            # Check for existing SSH keys
            if [[ -f "$HOME/.ssh/id_ed25519.pub" ]]; then
                SSH_PUB_KEY=$(cat "$HOME/.ssh/id_ed25519.pub")
                KEY_FILE="$HOME/.ssh/id_ed25519.pub"
            elif [[ -f "$HOME/.ssh/id_rsa.pub" ]]; then
                SSH_PUB_KEY=$(cat "$HOME/.ssh/id_rsa.pub")
                KEY_FILE="$HOME/.ssh/id_rsa.pub"
            else
                echo ""
                echo "No SSH key found. Generating new one..."
                ssh-keygen -t ed25519 -C "digitalocean-cli" -f "$HOME/.ssh/id_ed25519" -N ""
                SSH_PUB_KEY=$(cat "$HOME/.ssh/id_ed25519.pub")
                KEY_FILE="$HOME/.ssh/id_ed25519.pub"
            fi
            
            echo ""
            echo "Uploading SSH key from: ${KEY_FILE}"
            
            UPLOAD_RESPONSE=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${TOKEN}" \
                -d "{\"name\":\"$(hostname)-key\",\"public_key\":\"${SSH_PUB_KEY}\"}" \
                "https://api.digitalocean.com/v2/account/keys")
            
            KEY_ID=$(echo "${UPLOAD_RESPONSE}" | jq -r '.ssh_key.id')
            KEY_NAME=$(echo "${UPLOAD_RESPONSE}" | jq -r '.ssh_key.name')
            
            if [[ -n "${KEY_ID}" && "${KEY_ID}" != "null" ]]; then
                echo "✅ SSH key uploaded successfully!"
                echo "   ID: ${KEY_ID}"
                echo "   Name: ${KEY_NAME}"
                echo ""
            else
                echo "❌ Failed to upload SSH key"
                echo "${UPLOAD_RESPONSE}" | jq .
                exit 1
            fi
        fi
    fi
fi

# ============================================================================
# STEP 3: Save Configuration
# ============================================================================

if [[ -n "$TOKEN" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 3: Save Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Do you want to save these credentials to .env file? (y/n)"
    read -r SAVE_ENV
    
    if [[ "$SAVE_ENV" =~ ^[Yy]$ ]]; then
        echo -n "Enter your SSH Key ID: "
        read -r SSH_KEY_ID
        
        cat > .env << EOF
# DigitalOcean Credentials
# Source this file: source .env
export DIGITALOCEAN_TOKEN="${TOKEN}"
export DO_SSH_KEY_ID="${SSH_KEY_ID}"
export DO_REGION="nyc3"
export DO_IMAGE="ubuntu-22-04-x64"
EOF
        
        echo "✅ Credentials saved to .env"
        echo ""
        echo "To use them, run:"
        echo "  source .env"
        echo ""
    else
        echo ""
        echo "Manual export commands:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "export DIGITALOCEAN_TOKEN=\"${TOKEN}\""
        echo "export DO_SSH_KEY_ID=\"YOUR_SSH_KEY_ID_HERE\""
        echo ""
    fi
fi

# ============================================================================
# Summary
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. source .env                    # Load credentials"
echo "  2. ./verify_setup.sh              # Verify everything"
echo "  3. ./create_do_api.sh my-test     # Create a droplet!"
echo ""
echo "📚 Documentation:"
echo "  cat QUICKSTART.md   # Fast setup guide"
echo "  cat README.md       # Complete documentation"
echo ""

