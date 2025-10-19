# ⚡ Quick Start Guide

Get up and running with DigitalOcean droplets in 5 minutes!

## 🎯 Prerequisites (2 minutes)

1. **Get a DigitalOcean API token:**
   - Go to: https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Name it (e.g., "CLI Access") and check "Write" scope
   - Copy the token immediately (you won't see it again!)

2. **Find your SSH key ID:**
   ```bash
   # If you have doctl installed:
   doctl auth init  # Paste your token
   doctl compute ssh-key list
   
   # Or use curl:
   curl -X GET -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.digitalocean.com/v2/account/keys" | jq '.ssh_keys[] | {id, name}'
   ```

3. **Install required tools (if not already installed):**
   ```bash
   # macOS
   brew install doctl jq curl
   
   # Ubuntu/Debian
   apt-get install jq curl
   snap install doctl
   ```

## 🚀 Setup (1 minute)

```bash
# Navigate to the digitalocean folder
cd digitalocean/

# Set your credentials
export DIGITALOCEAN_TOKEN="dop_v1_xxxxxxxxxxxxxxxxxxxxx"
export DO_SSH_KEY_ID="12345678"

# Optional: set defaults
export DO_REGION="nyc3"              # Default region
export DO_IMAGE="ubuntu-22-04-x64"   # Default OS image

# Verify everything is set up correctly
./verify_setup.sh
```

## 🎉 Create Your First Droplet (1 minute)

### Option 1: Using doctl CLI (Recommended)

```bash
# Create a standard droplet (2 vCPU, 4GB RAM)
./create_do_gpu.sh my-first-test

# Or specify a size
./create_do_gpu.sh my-server s-4vcpu-8gb

# Or create a GPU droplet (if available in your region)
./create_do_gpu.sh my-gpu-test g-8vcpu-48gb-nvidia-l40sx1-48gb
```

### Option 2: Using REST API

```bash
# Same commands, different script
./create_do_api.sh my-api-test s-2vcpu-4gb
```

## 📊 View Your Droplets

```bash
# List all droplets with the 'gpu-demo' tag
./show_droplet_info.sh

# You'll see:
# - Droplet ID, name, IP address
# - Status, region, size
# - Quick SSH commands
```

## 🔗 Connect to Your Droplet

```bash
# Wait ~30 seconds for cloud-init to complete, then:
ssh root@YOUR_DROPLET_IP

# Check cloud-init status
cloud-init status

# View demo workload results
cat /home/demo/tests/demo.log
```

## 🧪 What Runs Automatically?

When you create a droplet, the cloud-init script automatically:

1. ✅ Installs: Docker, Python, iperf3, stress, htop, and more
2. ✅ Runs a 60-second CPU stress test
3. ✅ Tests network bandwidth with iperf3
4. ✅ Starts an iperf3 server (port 5201)
5. ✅ Tests Docker and Python installations
6. ✅ Logs everything to `/home/demo/tests/demo.log`

## 🧹 Clean Up

```bash
# Delete a specific droplet
doctl compute droplet delete <droplet-id>

# Or delete all droplets with the 'gpu-demo' tag
doctl compute droplet delete --tag-name gpu-demo
```

## 🐛 Troubleshooting

### "doctl: command not found"
```bash
brew install doctl
```

### "Authentication failed"
- Double-check your token is correct
- Ensure it has read+write permissions
- Generate a new token if needed

### "SSH key not found"
```bash
# List your keys
doctl compute ssh-key list

# Use the ID from the output
export DO_SSH_KEY_ID="12345678"
```

### Scripts won't run
```bash
# Make them executable
chmod +x *.sh
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize `cloudinit_userdata.yaml` for your needs
- Check logs in `logs/` directory for debugging
- Explore GPU droplet options for ML/AI workloads

## 💡 Pro Tips

1. **Save credentials in .env file:**
   ```bash
   cat > .env <<EOF
   export DIGITALOCEAN_TOKEN="your_token"
   export DO_SSH_KEY_ID="12345678"
   export DO_REGION="nyc3"
   EOF
   
   # Then source it:
   source .env
   ```

2. **Create multiple droplets:**
   ```bash
   for i in {1..3}; do
       ./create_do_gpu.sh "test-${i}" s-2vcpu-4gb
   done
   ```

3. **Monitor costs:**
   - Check DigitalOcean dashboard regularly
   - Delete unused droplets promptly
   - Standard droplets: ~$24-$48/month
   - GPU droplets: ~$2-$6/hour

## 🎯 Common Droplet Sizes

| Size | vCPUs | RAM | Disk | Price/mo | Use Case |
|------|-------|-----|------|----------|----------|
| `s-1vcpu-1gb` | 1 | 1GB | 25GB | $6 | Tiny test |
| `s-2vcpu-4gb` | 2 | 4GB | 80GB | $24 | Small app |
| `s-4vcpu-8gb` | 4 | 8GB | 160GB | $48 | Web server |
| `g-2vcpu-8gb` | 2 | 8GB | 50GB | $72 | General purpose |
| `g-8vcpu-48gb-nvidia-l40sx1-48gb` | 8 | 48GB | 300GB | ~$2/hr | GPU/ML |

---

**Ready to scale? Check out the full [README.md](README.md) for advanced usage!** 🚀

