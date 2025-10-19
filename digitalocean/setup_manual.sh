#!/bin/bash
#
# setup_manual.sh - Manual credential setup (bypasses interactive prompts)
#
# Edit this file and add your credentials, then run it.
#

set -euo pipefail

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    Manual Credential Setup                                 ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# EDIT THESE VALUES
# ============================================================================

# Your DigitalOcean API Token (with BOTH Read + Write permissions)
# Get it from: https://cloud.digitalocean.com/account/api/tokens
TOKEN="PASTE_YOUR_NEW_TOKEN_HERE"

# Your SSH Key ID
# Get it by running: curl -H "Authorization: Bearer YOUR_TOKEN" \
#   "https://api.digitalocean.com/v2/account/keys" | jq '.ssh_keys[] | {id, name}'
SSH_KEY_ID="PASTE_YOUR_SSH_KEY_ID_HERE"

# ============================================================================
# Don't edit below unless you know what you're doing
# ============================================================================

if [[ "$TOKEN" == "PASTE_YOUR_NEW_TOKEN_HERE" ]]; then
    echo "❌ ERROR: You need to edit this file first!"
    echo ""
    echo "Steps:"
    echo "  1. Get a NEW token with BOTH Read + Write permissions:"
    echo "     https://cloud.digitalocean.com/account/api/tokens"
    echo ""
    echo "  2. Edit this file:"
    echo "     nano setup_manual.sh"
    echo ""
    echo "  3. Replace 'PASTE_YOUR_NEW_TOKEN_HERE' with your token"
    echo ""
    echo "  4. Get your SSH key ID by running:"
    echo "     curl -H \"Authorization: Bearer YOUR_TOKEN\" \\"
    echo "       \"https://api.digitalocean.com/v2/account/keys\" | jq '.ssh_keys[] | {id, name}'"
    echo ""
    echo "  5. Replace 'PASTE_YOUR_SSH_KEY_ID_HERE' with the key ID"
    echo ""
    echo "  6. Run this script again:"
    echo "     ./setup_manual.sh"
    echo ""
    exit 1
fi

echo "Testing token..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://api.digitalocean.com/v2/account" 2>&1)

HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [[ "${HTTP_CODE}" == "200" ]]; then
    EMAIL=$(echo "${BODY}" | jq -r '.account.email // "unknown"')
    echo "✅ Token is valid!"
    echo "   Account: ${EMAIL}"
    echo ""
else
    echo "❌ Token test failed (HTTP ${HTTP_CODE})"
    echo ""
    if [[ "${HTTP_CODE}" == "403" ]]; then
        echo "   This means your token doesn't have the right permissions!"
        echo "   You MUST create a new token with BOTH Read + Write checked."
        echo ""
        echo "   Go to: https://cloud.digitalocean.com/account/api/tokens"
        echo "   Delete the old token and create a new one."
        echo "   Make sure to check BOTH boxes: ☑ Read  ☑ Write"
    fi
    echo ""
    exit 1
fi

# Test SSH key
echo "Checking SSH key..."
SSH_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://api.digitalocean.com/v2/account/keys/${SSH_KEY_ID}" 2>&1)

KEY_NAME=$(echo "${SSH_RESPONSE}" | jq -r '.ssh_key.name // empty')

if [[ -n "${KEY_NAME}" ]]; then
    echo "✅ SSH key found: ${KEY_NAME}"
    echo ""
else
    echo "⚠️  SSH key ID not found or invalid"
    echo ""
    echo "List your SSH keys:"
    curl -s -H "Authorization: Bearer ${TOKEN}" \
        "https://api.digitalocean.com/v2/account/keys" | \
        jq -r '.ssh_keys[] | "  ID: \(.id) - \(.name)"'
    echo ""
    echo "Edit this file and update SSH_KEY_ID with one of the IDs above."
    echo ""
    exit 1
fi

# Save to .env file
echo "Saving credentials to .env file..."
cat > .env << ENVEOF
# DigitalOcean Credentials
# Generated: $(date)
export DIGITALOCEAN_TOKEN="${TOKEN}"
export DO_SSH_KEY_ID="${SSH_KEY_ID}"
export DO_REGION="nyc3"
export DO_IMAGE="ubuntu-22-04-x64"
ENVEOF

echo "✅ Credentials saved to .env"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Load credentials:"
echo "     source .env"
echo ""
echo "  2. Verify setup:"
echo "     ./verify_setup.sh"
echo ""
echo "  3. Create your first droplet:"
echo "     ./create_do_api.sh my-test s-2vcpu-4gb"
echo ""
