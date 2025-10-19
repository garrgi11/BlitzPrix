#!/bin/bash
#
# show_droplet_info.sh - List all droplets tagged with 'gpu-demo' and show their details
#
# Usage:
#   ./show_droplet_info.sh [tag]
#
# Example:
#   ./show_droplet_info.sh
#   ./show_droplet_info.sh gpu-demo
#

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

DO_TOKEN="${DIGITALOCEAN_TOKEN:-YOUR_DO_TOKEN_HERE}"
DEFAULT_TAG="gpu-demo"
API_URL="https://api.digitalocean.com/v2"

# ============================================================================
# SCRIPT SETUP
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/droplet_info_${TIMESTAMP}.log"

# Ensure logs directory exists
mkdir -p "${LOG_DIR}"

# ============================================================================
# FUNCTIONS
# ============================================================================

log() {
    echo "$*" | tee -a "${LOG_FILE}"
}

error() {
    echo "ERROR: $*" | tee -a "${LOG_FILE}" >&2
    exit 1
}

check_dependencies() {
    local missing=()
    
    command -v curl &> /dev/null || missing+=("curl")
    command -v jq &> /dev/null || missing+=("jq")
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing[*]}. Install with: brew install ${missing[*]}"
    fi
}

check_doctl() {
    command -v doctl &> /dev/null
}

# ============================================================================
# MAIN
# ============================================================================

TAG="${1:-${DEFAULT_TAG}}"

log "=========================================="
log "DigitalOcean Droplet Information"
log "=========================================="
log "Tag: ${TAG}"
log "Timestamp: $(date)"
log ""

check_dependencies

# Try using doctl if available, otherwise use API
if check_doctl; then
    log "Using doctl CLI..."
    log ""
    
    # Get droplets by tag
    DROPLETS=$(doctl compute droplet list --tag-name "${TAG}" --format ID,Name,PublicIPv4,Status,Region,Size,VCPUs,Memory,Disk --no-header 2>&1)
    
    if [[ -z "${DROPLETS}" ]]; then
        log "No droplets found with tag: ${TAG}"
        exit 0
    fi
    
    # Count droplets
    DROPLET_COUNT=$(echo "${DROPLETS}" | wc -l | tr -d ' ')
    log "Found ${DROPLET_COUNT} droplet(s):"
    log ""
    
    # Print header
    printf "%-12s %-25s %-18s %-10s %-8s %-30s\n" "ID" "NAME" "PUBLIC IP" "STATUS" "REGION" "SIZE"
    printf "%s\n" "$(printf '=%.0s' {1..110})"
    
    # Print droplets
    echo "${DROPLETS}" | while read -r line; do
        echo "$line"
    done | column -t
    
    log ""
    log "=========================================="
    log "Quick SSH Commands:"
    log "=========================================="
    
    echo "${DROPLETS}" | while IFS= read -r line; do
        NAME=$(echo "$line" | awk '{print $2}')
        IP=$(echo "$line" | awk '{print $3}')
        if [[ -n "${IP}" && "${IP}" != "<no" ]]; then
            log "ssh root@${IP}  # ${NAME}"
        fi
    done
    
else
    # Use API
    log "Using DigitalOcean API..."
    
    if [[ "${DO_TOKEN}" == "YOUR_DO_TOKEN_HERE" ]]; then
        error "Please set DIGITALOCEAN_TOKEN environment variable or update DO_TOKEN in the script"
    fi
    
    log ""
    
    # Get droplets by tag via API
    RESPONSE=$(curl -s -X GET \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DO_TOKEN}" \
        "${API_URL}/droplets?tag_name=${TAG}")
    
    # Check for errors
    if echo "${RESPONSE}" | jq -e '.message' &> /dev/null; then
        ERROR_MSG=$(echo "${RESPONSE}" | jq -r '.message')
        error "API error: ${ERROR_MSG}"
    fi
    
    # Count droplets
    DROPLET_COUNT=$(echo "${RESPONSE}" | jq '.droplets | length')
    
    if [[ "${DROPLET_COUNT}" == "0" ]]; then
        log "No droplets found with tag: ${TAG}"
        exit 0
    fi
    
    log "Found ${DROPLET_COUNT} droplet(s):"
    log ""
    
    # Print header
    printf "%-12s %-25s %-18s %-10s %-8s %-20s\n" "ID" "NAME" "PUBLIC IP" "STATUS" "REGION" "SIZE"
    printf "%s\n" "$(printf '=%.0s' {1..100})"
    
    # Parse and display droplets
    echo "${RESPONSE}" | jq -r '.droplets[] | [.id, .name, .networks.v4[0].ip_address // "no-ip", .status, .region.slug, .size.slug] | @tsv' | while IFS=$'\t' read -r id name ip status region size; do
        printf "%-12s %-25s %-18s %-10s %-8s %-20s\n" "$id" "$name" "$ip" "$status" "$region" "$size"
    done
    
    log ""
    log "=========================================="
    log "Detailed Information:"
    log "=========================================="
    
    echo "${RESPONSE}" | jq -r '.droplets[] | [.id, .name, .networks.v4[0].ip_address // "no-ip", .status, .vcpus, (.memory/1024|tostring + "GB"), (.disk|tostring + "GB")] | @tsv' | while IFS=$'\t' read -r id name ip status vcpus memory disk; do
        log ""
        log "Droplet: ${name} (ID: ${id})"
        log "  IP Address: ${ip}"
        log "  Status: ${status}"
        log "  Resources: ${vcpus} vCPUs, ${memory} RAM, ${disk} Disk"
        if [[ "${ip}" != "no-ip" ]]; then
            log "  SSH: ssh root@${ip}"
        fi
    done
fi

log ""
log "=========================================="
log "Management Commands:"
log "=========================================="
log "Delete a droplet:"
log "  doctl compute droplet delete <droplet-id>"
log ""
log "Delete all droplets with tag '${TAG}':"
log "  doctl compute droplet delete --tag-name ${TAG}"
log ""
log "View droplet details:"
log "  doctl compute droplet get <droplet-id>"
log ""

log "Log saved to: ${LOG_FILE}"

