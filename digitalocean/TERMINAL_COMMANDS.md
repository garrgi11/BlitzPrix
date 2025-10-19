# 📋 DigitalOcean Terminal Commands Reference

Complete guide to getting credentials and managing droplets from the terminal.

## 🚀 Quickest Method: Interactive Helper

```bash
cd digitalocean/
./get_credentials.sh
```

This interactive script will:
- ✓ Guide you to get your API token
- ✓ Fetch your SSH keys automatically
- ✓ Upload SSH key if needed
- ✓ Save credentials to `.env` file
- ✓ Test everything works

---

## 📝 Manual Commands (DIY Approach)

### 1️⃣ Get API Token
**Must use web interface:**
- Open: https://cloud.digitalocean.com/account/api/tokens
- Click "Generate New Token"
- Name it (e.g., "CLI Access")
- Check scopes: ✓ Read ✓ Write
- Copy the token (starts with `dop_v1_...`)

### 2️⃣ Test Your Token
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.digitalocean.com/v2/account" | jq .
```

### 3️⃣ List Your SSH Keys
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.digitalocean.com/v2/account/keys" | jq '.ssh_keys[] | {id, name}'
```

**Output example:**
```json
{
  "id": 12345678,
  "name": "My Laptop Key"
}
```

Use the `id` number as your `DO_SSH_KEY_ID`.

### 4️⃣ Upload New SSH Key (If Needed)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"my-key","public_key":"'"$(cat ~/.ssh/id_ed25519.pub)"'"}' \
  "https://api.digitalocean.com/v2/account/keys" | jq .
```

### 5️⃣ List Available Droplet Sizes
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.digitalocean.com/v2/sizes" | jq '.sizes[] | {slug, memory, vcpus, price_monthly}'
```

### 6️⃣ List Available Regions
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.digitalocean.com/v2/regions" | jq '.regions[] | {name, slug, available}'
```

---

## ⚙️ Set Up Credentials

### Option A: Temporary (Current Session Only)
```bash
export DIGITALOCEAN_TOKEN="dop_v1_xxxxxxxxxxxxx"
export DO_SSH_KEY_ID="12345678"
```

### Option B: Persistent (Save to File)
```bash
cat > digitalocean/.env << 'ENVEOF'
export DIGITALOCEAN_TOKEN="dop_v1_xxxxxxxxxxxxx"
export DO_SSH_KEY_ID="12345678"
export DO_REGION="nyc3"
export DO_IMAGE="ubuntu-22-04-x64"
ENVEOF

# Load it:
source digitalocean/.env
```

---

## 🔍 Verify Setup

```bash
cd digitalocean/
./verify_setup.sh
```

This checks:
- ✓ Required tools (curl, jq)
- ✓ API token is set and valid
- ✓ SSH key ID is set and exists
- ✓ All scripts are executable

---

## 🚀 Create Droplet

```bash
./create_do_api.sh my-first-test s-2vcpu-4gb
```

Or with custom settings:
```bash
DO_REGION=sfo3 ./create_do_api.sh my-west-coast-test s-4vcpu-8gb
```

---

## 📊 View Your Droplets

### Using Our Script:
```bash
./show_droplet_info.sh
```

### Manual Command:
```bash
curl -X GET \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets?tag_name=gpu-demo" | jq .
```

---

## 🗑️ Delete Droplet

### Get Droplet ID First:
```bash
./show_droplet_info.sh
```

### Delete by ID:
```bash
curl -X DELETE \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets/DROPLET_ID"
```

### Delete All with Tag:
```bash
curl -X DELETE \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets?tag_name=gpu-demo"
```

---

## ✅ Complete Workflow Example

```bash
# Navigate to the folder
cd digitalocean/

# Get credentials (interactive helper)
./get_credentials.sh

# Load credentials
source .env

# Verify everything is ready
./verify_setup.sh

# Create your first droplet
./create_do_api.sh my-test s-2vcpu-4gb

# Wait ~60 seconds, then view droplets
./show_droplet_info.sh

# SSH into your droplet
ssh root@<droplet-ip>

# Check cloud-init results
cloud-init status
cat /home/demo/tests/demo.log
```

---

## 🔧 Useful API Endpoints

### Account Info
```bash
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/account" | jq .
```

### List All Droplets
```bash
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets" | jq .
```

### Get Specific Droplet
```bash
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets/DROPLET_ID" | jq .
```

### List Images
```bash
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/images?type=distribution" | jq '.images[] | {name, slug}'
```

---

## 💰 Common Droplet Sizes

| Size | vCPUs | RAM | Disk | Price/mo | Price/hr |
|------|-------|-----|------|----------|----------|
| `s-1vcpu-1gb` | 1 | 1GB | 25GB | $6 | $0.009 |
| `s-2vcpu-4gb` | 2 | 4GB | 80GB | $24 | $0.036 |
| `s-4vcpu-8gb` | 4 | 8GB | 160GB | $48 | $0.071 |
| `s-8vcpu-16gb` | 8 | 16GB | 320GB | $96 | $0.143 |

GPU droplets start at ~$2-6/hour.

---

## 📚 Related Documentation

- [README.md](README.md) - Complete system documentation
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [QUICKREF.txt](QUICKREF.txt) - Command cheat sheet
- [DigitalOcean API Docs](https://docs.digitalocean.com/reference/api/)

---

## 🆘 Troubleshooting

### "jq: command not found"
```bash
brew install jq
```

### "Invalid token"
- Regenerate token at: https://cloud.digitalocean.com/account/api/tokens
- Ensure it has read+write permissions

### "SSH key not found"
```bash
# List your keys
./get_credentials.sh

# Or manually
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/account/keys" | jq .
```

---

**🎉 You're all set! Happy cloud computing!**
