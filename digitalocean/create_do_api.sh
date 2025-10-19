#!/bin/bash
#
# create_do_api.sh - Create DigitalOcean droplets using raw REST API with curl
#
# Usage:
#   ./create_do_api.sh [droplet-name] [size]
#
# Example:
#   ./create_do_api.sh my-api-test s-4vcpu-8gb
#   ./create_do_api.sh my-gpu-test g-8vcpu-48gb-nvidia-l40sx1-48gb
#

set -euo pipefail

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

DO_TOKEN="${DIGITALOCEAN_TOKEN:-YOUR_DO_TOKEN_HERE}"
SSH_KEY_ID="${DO_SSH_KEY_ID:-YOUR_SSH_KEY_ID_HERE}"
REGION="${DO_REGION:-nyc3}"
IMAGE="${DO_IMAGE:-ubuntu-22-04-x64}"
TAG="gpu-demo"
API_URL="https://api.digitalocean.com/v2"

# ============================================================================
# SCRIPT SETUP
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/create_api_${TIMESTAMP}.log"

# Ensure logs directory exists
mkdir -p "${LOG_DIR}"

# ============================================================================
# FUNCTIONS
# ============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "${LOG_FILE}" >&2
    exit 1
}

check_dependencies() {
    local missing=()
    
    command -v curl &> /dev/null || missing+=("curl")
    command -v jq &> /dev/null || missing+=("jq")
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing[*]}. Install with: brew install ${missing[*]}"
    fi
    
    log "✓ Required tools found (curl, jq)"
}

check_auth() {
    if [[ "${DO_TOKEN}" == "YOUR_DO_TOKEN_HERE" ]]; then
        error "Please set DIGITALOCEAN_TOKEN environment variable or update DO_TOKEN in the script"
    fi
    
    # Test API authentication
    log "Testing API authentication..."
    local response
    response=$(curl -s -w "\n%{http_code}" -X GET \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DO_TOKEN}" \
        "${API_URL}/account" 2>&1)
    
    local http_code=$(echo "${response}" | tail -n1)
    local body=$(echo "${response}" | sed '$d')
    
    if [[ "${http_code}" != "200" ]]; then
        error "API authentication failed (HTTP ${http_code}). Check your token."
    fi
    
    local account_email=$(echo "${body}" | jq -r '.account.email // "unknown"')
    log "✓ Authenticated as: ${account_email}"
}

wait_for_droplet() {
    local droplet_id=$1
    local max_attempts=60
    local attempt=1
    
    log "Waiting for droplet to become active..."
    
    while [[ $attempt -le $max_attempts ]]; do
        local response
        response=$(curl -s -X GET \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${DO_TOKEN}" \
            "${API_URL}/droplets/${droplet_id}")
        
        local status=$(echo "${response}" | jq -r '.droplet.status // "unknown"')
        
        if [[ "${status}" == "active" ]]; then
            log "✓ Droplet is active!"
            echo "${response}"
            return 0
        fi
        
        log "  Status: ${status} (attempt ${attempt}/${max_attempts})"
        sleep 5
        ((attempt++))
    done
    
    error "Timeout waiting for droplet to become active"
}

# ============================================================================
# MAIN
# ============================================================================

log "========================================"
log "DigitalOcean Droplet Creation (API)"
log "========================================"

# Parse arguments
DROPLET_NAME="${1:-api-test-$(date +%s)}"
DROPLET_SIZE="${2:-s-2vcpu-4gb}"

log "Configuration:"
log "  Droplet Name: ${DROPLET_NAME}"
log "  Size: ${DROPLET_SIZE}"
log "  Region: ${REGION}"
log "  Image: ${IMAGE}"
log "  SSH Key ID: ${SSH_KEY_ID}"
log "  Tag: ${TAG}"
log ""

# Verify prerequisites
check_dependencies
check_auth

# Load cloud-init userdata if available
USERDATA_FILE="${SCRIPT_DIR}/cloudinit_userdata.yaml"
if [[ -f "${USERDATA_FILE}" ]]; then
    USERDATA=$(cat "${USERDATA_FILE}")
    log "✓ Loaded cloud-init from: ${USERDATA_FILE}"
else
    USERDATA=""
    log "⚠ Warning: cloudinit_userdata.yaml not found, creating droplet without user-data"
fi

# Build JSON payload
log "Building API request payload..."

if [[ -n "${USERDATA}" ]]; then
    # Escape userdata for JSON
    USERDATA_ESCAPED=$(echo "${USERDATA}" | jq -Rs .)
    JSON_PAYLOAD=$(cat <<EOF
{
  "name": "${DROPLET_NAME}",
  "region": "${REGION}",
  "size": "${DROPLET_SIZE}",
  "image": "${IMAGE}",
  "ssh_keys": [${SSH_KEY_ID}],
  "backups": false,
  "ipv6": true,
  "monitoring": true,
  "tags": ["${TAG}"],
  "user_data": ${USERDATA_ESCAPED}
}
EOF
)
else
    JSON_PAYLOAD=$(cat <<EOF
{
  "name": "${DROPLET_NAME}",
  "region": "${REGION}",
  "size": "${DROPLET_SIZE}",
  "image": "${IMAGE}",
  "ssh_keys": [${SSH_KEY_ID}],
  "backups": false,
  "ipv6": true,
  "monitoring": true,
  "tags": ["${TAG}"]
}
EOF
)
fi

# Save request payload to log
log "API Request Payload:"
echo "${JSON_PAYLOAD}" | jq '.' | tee -a "${LOG_FILE}"
log ""

# Create droplet via API
log "Sending create droplet request..."
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${DO_TOKEN}" \
    -d "${JSON_PAYLOAD}" \
    "${API_URL}/droplets" 2>&1)

HTTP_CODE=$(echo "${CREATE_RESPONSE}" | tail -n1)
RESPONSE_BODY=$(echo "${CREATE_RESPONSE}" | sed '$d')

# Save full response to log
echo "API Response (HTTP ${HTTP_CODE}):" >> "${LOG_FILE}"
echo "${RESPONSE_BODY}" | jq '.' >> "${LOG_FILE}" 2>&1

if [[ "${HTTP_CODE}" == "202" ]]; then
    log "✓ Droplet creation request accepted (HTTP 202)"
    
    # Extract droplet ID
    DROPLET_ID=$(echo "${RESPONSE_BODY}" | jq -r '.droplet.id')
    log "Droplet ID: ${DROPLET_ID}"
    
    # Wait for droplet to become active
    DROPLET_INFO=$(wait_for_droplet "${DROPLET_ID}")
    
    # Extract details
    DROPLET_IP=$(echo "${DROPLET_INFO}" | jq -r '.droplet.networks.v4[0].ip_address // "unknown"')
    DROPLET_STATUS=$(echo "${DROPLET_INFO}" | jq -r '.droplet.status')
    
    # Wait for cloud-init
    log ""
    log "Waiting 30 seconds for cloud-init to initialize..."
    sleep 30
    
    log ""
    log "========================================"
    log "✓ SUCCESS!"
    log "========================================"
    log "Droplet ID: ${DROPLET_ID}"
    log "Droplet IP: ${DROPLET_IP}"
    log "Status: ${DROPLET_STATUS}"
    log ""
    log "Connect with:"
    log "  ssh root@${DROPLET_IP}"
    log ""
    log "Check cloud-init status:"
    log "  ssh root@${DROPLET_IP} 'cloud-init status'"
    log ""
    log "View demo logs:"
    log "  ssh root@${DROPLET_IP} 'cat /home/demo/tests/demo.log'"
    
else
    ERROR_MSG=$(echo "${RESPONSE_BODY}" | jq -r '.message // "Unknown error"')
    error "Failed to create droplet (HTTP ${HTTP_CODE}): ${ERROR_MSG}"
fi

log ""
log "Full log saved to: ${LOG_FILE}"

