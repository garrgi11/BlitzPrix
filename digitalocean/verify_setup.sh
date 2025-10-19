#!/bin/bash
#
# verify_setup.sh - Verify that all prerequisites are met before creating droplets
#
# Usage:
#   ./verify_setup.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_success() {
    echo -e "${GREEN}✓${NC} $*"
}

print_error() {
    echo -e "${RED}✗${NC} $*"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

print_info() {
    echo -e "ℹ $*"
}

check_command() {
    local cmd=$1
    local install_hint=$2
    
    if command -v "$cmd" &> /dev/null; then
        print_success "$cmd is installed: $(command -v $cmd)"
        return 0
    else
        print_error "$cmd is NOT installed"
        print_info "  Install with: $install_hint"
        return 1
    fi
}

check_env_var() {
    local var_name=$1
    local hint=$2
    
    if [[ -n "${!var_name:-}" && "${!var_name}" != "YOUR_"* ]]; then
        print_success "$var_name is set: ${!var_name:0:20}..."
        return 0
    else
        print_error "$var_name is NOT set or uses placeholder"
        print_info "  $hint"
        return 1
    fi
}

# ============================================================================
# MAIN
# ============================================================================

echo "=========================================="
echo "DigitalOcean Setup Verification"
echo "=========================================="
echo ""

ERRORS=0

# Check required commands
echo "Checking Required Tools:"
echo "------------------------"
check_command "curl" "brew install curl (usually pre-installed)" || ((ERRORS++))
check_command "jq" "brew install jq" || ((ERRORS++))
echo ""

# Check optional commands
echo "Checking Optional Tools:"
echo "------------------------"
if check_command "doctl" "brew install doctl"; then
    # Check doctl version
    DOCTL_VERSION=$(doctl version | head -1)
    print_info "  Version: $DOCTL_VERSION"
else
    print_warning "doctl not installed (required for create_do_gpu.sh)"
fi
echo ""

# Check environment variables
echo "Checking Environment Variables:"
echo "--------------------------------"
check_env_var "DIGITALOCEAN_TOKEN" "Set with: export DIGITALOCEAN_TOKEN='your_token_here'" || ((ERRORS++))
check_env_var "DO_SSH_KEY_ID" "Set with: export DO_SSH_KEY_ID='your_ssh_key_id'" || ((ERRORS++))

# Optional vars
if [[ -n "${DO_REGION:-}" ]]; then
    print_success "DO_REGION is set: ${DO_REGION}"
else
    print_info "DO_REGION not set (will use default: nyc3)"
fi

if [[ -n "${DO_IMAGE:-}" ]]; then
    print_success "DO_IMAGE is set: ${DO_IMAGE}"
else
    print_info "DO_IMAGE not set (will use default: ubuntu-22-04-x64)"
fi
echo ""

# Check if scripts are executable
echo "Checking Script Permissions:"
echo "----------------------------"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for script in create_do_gpu.sh create_do_api.sh show_droplet_info.sh; do
    if [[ -x "${SCRIPT_DIR}/${script}" ]]; then
        print_success "${script} is executable"
    else
        print_error "${script} is NOT executable"
        print_info "  Fix with: chmod +x ${script}"
        ((ERRORS++))
    fi
done
echo ""

# Check if required files exist
echo "Checking Required Files:"
echo "------------------------"
for file in cloudinit_userdata.yaml README.md; do
    if [[ -f "${SCRIPT_DIR}/${file}" ]]; then
        print_success "${file} exists"
    else
        print_error "${file} is missing"
        ((ERRORS++))
    fi
done

if [[ -d "${SCRIPT_DIR}/logs" ]]; then
    print_success "logs/ directory exists"
else
    print_warning "logs/ directory does not exist (will be created automatically)"
fi
echo ""

# Test API authentication if token is set
if [[ -n "${DIGITALOCEAN_TOKEN:-}" && "${DIGITALOCEAN_TOKEN}" != "YOUR_"* ]]; then
    echo "Testing DigitalOcean API Authentication:"
    echo "----------------------------------------"
    
    API_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DIGITALOCEAN_TOKEN}" \
        "https://api.digitalocean.com/v2/account" 2>&1 || echo -e "\n000")
    
    HTTP_CODE=$(echo "${API_RESPONSE}" | tail -n1)
    RESPONSE_BODY=$(echo "${API_RESPONSE}" | sed '$d')
    
    if [[ "${HTTP_CODE}" == "200" ]]; then
        ACCOUNT_EMAIL=$(echo "${RESPONSE_BODY}" | jq -r '.account.email // "unknown"')
        ACCOUNT_STATUS=$(echo "${RESPONSE_BODY}" | jq -r '.account.status // "unknown"')
        print_success "API authentication successful"
        print_info "  Account: ${ACCOUNT_EMAIL} (${ACCOUNT_STATUS})"
        
        # Check SSH keys
        SSH_RESPONSE=$(curl -s -X GET \
            -H "Authorization: Bearer ${DIGITALOCEAN_TOKEN}" \
            "https://api.digitalocean.com/v2/account/keys" 2>&1)
        
        SSH_KEY_COUNT=$(echo "${SSH_RESPONSE}" | jq '.ssh_keys | length')
        print_info "  SSH Keys: ${SSH_KEY_COUNT} key(s) found"
        
        if [[ -n "${DO_SSH_KEY_ID:-}" && "${DO_SSH_KEY_ID}" != "YOUR_"* ]]; then
            # Verify the specified SSH key exists
            KEY_EXISTS=$(echo "${SSH_RESPONSE}" | jq --arg id "${DO_SSH_KEY_ID}" '.ssh_keys[] | select(.id == ($id|tonumber)) | .name' -r)
            if [[ -n "${KEY_EXISTS}" ]]; then
                print_success "  Specified SSH key found: ${KEY_EXISTS}"
            else
                print_error "  Specified SSH key ID not found: ${DO_SSH_KEY_ID}"
                print_info "  Available SSH keys:"
                echo "${SSH_RESPONSE}" | jq -r '.ssh_keys[] | "    ID: \(.id) - \(.name)"'
                ((ERRORS++))
            fi
        fi
    else
        print_error "API authentication failed (HTTP ${HTTP_CODE})"
        ERROR_MSG=$(echo "${RESPONSE_BODY}" | jq -r '.message // "Unknown error"')
        print_info "  Error: ${ERROR_MSG}"
        ((ERRORS++))
    fi
    echo ""
fi

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

if [[ ${ERRORS} -eq 0 ]]; then
    print_success "All checks passed! You're ready to create droplets."
    echo ""
    echo "Next steps:"
    echo "  1. Review the README.md for usage examples"
    echo "  2. Create your first droplet:"
    echo "     ./create_do_gpu.sh my-test-droplet s-2vcpu-4gb"
    echo "  3. View created droplets:"
    echo "     ./show_droplet_info.sh"
    echo ""
    exit 0
else
    print_error "Found ${ERRORS} error(s). Please fix them before proceeding."
    echo ""
    echo "Common fixes:"
    echo "  1. Set environment variables:"
    echo "     export DIGITALOCEAN_TOKEN='your_token_here'"
    echo "     export DO_SSH_KEY_ID='your_ssh_key_id'"
    echo ""
    echo "  2. Install missing tools:"
    echo "     brew install doctl jq"
    echo ""
    echo "  3. Make scripts executable:"
    echo "     chmod +x *.sh"
    echo ""
    exit 1
fi

