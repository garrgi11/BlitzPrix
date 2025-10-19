#!/bin/bash
#
# create_do_gpu.sh - Create DigitalOcean GPU or standard droplets using doctl CLI
#
# Usage:
#   ./create_do_gpu.sh [droplet-name] [size]
#
# Example:
#   ./create_do_gpu.sh my-gpu-test g-32vcpu-128gb-nvidia-h100x1-80gb
#   ./create_do_gpu.sh my-standard-test s-4vcpu-8gb
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

# ============================================================================
# SCRIPT SETUP
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/create_doctl_${TIMESTAMP}.log"

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

check_doctl() {
    if ! command -v doctl &> /dev/null; then
        error "doctl CLI not found. Install it with: brew install doctl"
    fi
    log "✓ doctl CLI found"
}

check_auth() {
    if [[ "${DO_TOKEN}" == "YOUR_DO_TOKEN_HERE" ]]; then
        error "Please set DIGITALOCEAN_TOKEN environment variable or update DO_TOKEN in the script"
    fi
    
    # Test authentication
    if ! doctl auth init -t "${DO_TOKEN}" >> "${LOG_FILE}" 2>&1; then
        error "Failed to authenticate with DigitalOcean API"
    fi
    log "✓ Authentication successful"
}

# ============================================================================
# MAIN
# ============================================================================

log "========================================"
log "DigitalOcean Droplet Creation (doctl)"
log "========================================"

# Parse arguments
DROPLET_NAME="${1:-gpu-test-$(date +%s)}"
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
check_doctl
check_auth

# Check if cloud-init file exists
USERDATA_FILE="${SCRIPT_DIR}/cloudinit_userdata.yaml"
if [[ ! -f "${USERDATA_FILE}" ]]; then
    log "⚠ Warning: cloudinit_userdata.yaml not found, creating droplet without user-data"
    USERDATA_ARG=""
else
    USERDATA_ARG="--user-data-file ${USERDATA_FILE}"
    log "✓ Using cloud-init from: ${USERDATA_FILE}"
fi

# Create droplet
log "Creating droplet..."
CREATE_OUTPUT=$(doctl compute droplet create "${DROPLET_NAME}" \
    --size "${DROPLET_SIZE}" \
    --image "${IMAGE}" \
    --region "${REGION}" \
    --ssh-keys "${SSH_KEY_ID}" \
    --tag-name "${TAG}" \
    --enable-monitoring \
    --enable-ipv6 \
    ${USERDATA_ARG} \
    --format ID,Name,PublicIPv4,Status,Region \
    --no-header \
    --wait 2>&1 | tee -a "${LOG_FILE}")

if [[ $? -eq 0 ]]; then
    log "✓ Droplet created successfully!"
    log ""
    log "Droplet Details:"
    echo "${CREATE_OUTPUT}" | tee -a "${LOG_FILE}"
    log ""
    
    # Extract droplet ID
    DROPLET_ID=$(echo "${CREATE_OUTPUT}" | awk '{print $1}')
    log "Droplet ID: ${DROPLET_ID}"
    
    # Wait a bit for cloud-init to start
    log ""
    log "Waiting 30 seconds for cloud-init to initialize..."
    sleep 30
    
    # Get IP address
    DROPLET_IP=$(echo "${CREATE_OUTPUT}" | awk '{print $3}')
    
    if [[ -n "${DROPLET_IP}" && "${DROPLET_IP}" != "<no" ]]; then
        log ""
        log "========================================"
        log "✓ SUCCESS!"
        log "========================================"
        log "Droplet IP: ${DROPLET_IP}"
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
        log "⚠ Warning: Could not determine droplet IP address"
        log "Run: doctl compute droplet get ${DROPLET_ID}"
    fi
else
    error "Failed to create droplet. See log: ${LOG_FILE}"
fi

log ""
log "Full log saved to: ${LOG_FILE}"

