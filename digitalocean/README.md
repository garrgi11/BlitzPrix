# DigitalOcean GPU/AI Droplet Management Scripts

A complete set of bash scripts to easily spin up, test, and manage DigitalOcean GPU and standard droplets with automated workload testing.

## 📁 Folder Structure

```
digitalocean/
├── create_do_gpu.sh          # Create droplets using doctl CLI
├── create_do_api.sh           # Create droplets using REST API
├── cloudinit_userdata.yaml    # Cloud-init configuration
├── show_droplet_info.sh       # List and display droplet information
├── README.md                  # This file
└── logs/                      # Auto-generated logs directory
```

## 🚀 Quick Start

### Prerequisites

1. **DigitalOcean Account** with API access
2. **Required Tools:**
   ```bash
   # Install on macOS
   brew install doctl curl jq
   
   # Or on Ubuntu/Debian
   apt-get install curl jq
   snap install doctl
   ```

3. **DigitalOcean API Token**
   - Go to: https://cloud.digitalocean.com/account/api/tokens
   - Generate a new token with read/write access
   - Save it securely

4. **SSH Key** uploaded to DigitalOcean
   - Find your SSH key ID:
     ```bash
     doctl compute ssh-key list
     ```
   - Or via API:
     ```bash
     curl -X GET -H "Authorization: Bearer YOUR_TOKEN" \
       "https://api.digitalocean.com/v2/account/keys" | jq '.ssh_keys[] | {id, name}'
     ```

### Environment Setup

Set your credentials as environment variables:

```bash
# Required
export DIGITALOCEAN_TOKEN="your_do_token_here"
export DO_SSH_KEY_ID="your_ssh_key_id"

# Optional (defaults provided)
export DO_REGION="nyc3"              # Default: nyc3
export DO_IMAGE="ubuntu-22-04-x64"   # Default: ubuntu-22-04-x64
```

**Or** edit the configuration section at the top of each script.

---

## 📖 Usage Guide

### 1. Create Droplet Using doctl CLI

```bash
# Make script executable
chmod +x create_do_gpu.sh

# Create a standard droplet (default: s-2vcpu-4gb)
./create_do_gpu.sh my-test-droplet

# Create a specific size droplet
./create_do_gpu.sh my-droplet s-4vcpu-8gb

# Create a GPU droplet
./create_do_gpu.sh my-gpu-test g-8vcpu-48gb-nvidia-l40sx1-48gb
```

**Available GPU Sizes** (check current availability):
- `g-8vcpu-48gb-nvidia-l40sx1-48gb` - NVIDIA L40S (48GB)
- `g-16vcpu-96gb-nvidia-l40sx2-96gb` - 2x NVIDIA L40S
- `g-32vcpu-128gb-nvidia-h100x1-80gb` - NVIDIA H100 (80GB)
- `g-40vcpu-160gb-nvidia-h100x1-80gb` - NVIDIA H100 (larger instance)

**Standard Sizes:**
- `s-1vcpu-1gb` - $6/month
- `s-2vcpu-4gb` - $24/month
- `s-4vcpu-8gb` - $48/month
- `g-2vcpu-8gb` - $72/month (general purpose)

### 2. Create Droplet Using REST API

```bash
# Make script executable
chmod +x create_do_api.sh

# Create droplet via API
./create_do_api.sh my-api-droplet s-2vcpu-4gb

# GPU droplet via API
./create_do_api.sh my-gpu-api g-8vcpu-48gb-nvidia-l40sx1-48gb
```

**Advantages of API method:**
- No doctl installation required
- Full control over API parameters
- Easy to integrate into other tools
- Detailed JSON responses logged

### 3. View Created Droplets

```bash
# Make script executable
chmod +x show_droplet_info.sh

# Show all droplets with 'gpu-demo' tag
./show_droplet_info.sh

# Show droplets with custom tag
./show_droplet_info.sh my-custom-tag
```

**Output includes:**
- Droplet ID, Name, IP, Status
- Region, Size, Resources
- Quick SSH commands
- Management commands

---

## 🔧 Cloud-Init Configuration

The `cloudinit_userdata.yaml` file automatically configures new droplets with:

### Installed Packages
- **iperf3** - Network bandwidth testing
- **stress** - CPU stress testing
- **Docker** + Docker Compose
- **Python3** + pip
- **System tools**: htop, curl, wget, git, jq

### Demo Workload

Automatically runs on first boot:

1. **System Information Check**
   - CPU, memory, disk information
   - GPU detection (if available)

2. **60-Second CPU Stress Test**
   - Utilizes all CPU cores
   - Monitors load average every 5 seconds

3. **Network Bandwidth Test**
   - 10-second iperf3 test to public servers
   - Tests multiple servers for reliability
   - Reports bandwidth in Mbps

4. **iperf3 Server**
   - Starts persistent server on port 5201
   - Allows incoming bandwidth tests

5. **Docker & Python Tests**
   - Verifies Docker functionality
   - Tests Python installation

### View Results

SSH into your droplet and check the logs:

```bash
# Connect to droplet
ssh root@YOUR_DROPLET_IP

# View demo workload results
cat /home/demo/tests/demo.log

# Check cloud-init status
cloud-init status

# View cloud-init logs
tail -f /var/log/cloud-init-output.log
```

---

## 📊 Logs

All scripts automatically create logs in the `logs/` directory:

```
logs/
├── create_doctl_20241019_143022.log    # doctl creation logs
├── create_api_20241019_143045.log      # API creation logs
└── droplet_info_20241019_143100.log    # Droplet listing logs
```

**Log Contents:**
- Timestamps for all operations
- Full API requests/responses
- Error messages and debugging info
- Droplet details and connection info

---

## 🎯 Common Use Cases

### GPU Machine Learning Setup

```bash
# Create GPU droplet
./create_do_gpu.sh ml-training g-8vcpu-48gb-nvidia-l40sx1-48gb

# Wait for creation, then SSH in
ssh root@<droplet-ip>

# Verify GPU
nvidia-smi

# Install ML frameworks
pip3 install torch tensorflow

# Your training code here
```

### Web Server Testing

```bash
# Create standard droplet
./create_do_gpu.sh web-server s-2vcpu-4gb

# SSH and deploy
ssh root@<droplet-ip>

# Docker is already installed and running
docker run -d -p 80:80 nginx
```

### Batch Testing Multiple Configurations

```bash
# Create multiple droplets
for size in s-2vcpu-4gb s-4vcpu-8gb s-8vcpu-16gb; do
    ./create_do_gpu.sh "test-${size}" "${size}"
    sleep 5
done

# View all created droplets
./show_droplet_info.sh

# Clean up when done
doctl compute droplet delete --tag-name gpu-demo
```

---

## 🔒 Security Best Practices

1. **Never commit tokens** to version control
   ```bash
   # Add to .gitignore
   echo "digitalocean/*.log" >> .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables** for credentials
   ```bash
   # Create .env file (git-ignored)
   cat > .env <<EOF
   export DIGITALOCEAN_TOKEN="your_token"
   export DO_SSH_KEY_ID="12345678"
   EOF
   
   # Source it
   source .env
   ```

3. **Rotate tokens** regularly
   - Create new tokens monthly
   - Delete old/unused tokens

4. **Use SSH keys** instead of passwords
   ```bash
   # Generate SSH key if needed
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to DigitalOcean
   doctl compute ssh-key import my-key --public-key-file ~/.ssh/id_ed25519.pub
   ```

5. **Tag and organize** droplets
   - Use meaningful tags
   - Delete unused droplets promptly
   - Monitor costs regularly

---

## 🐛 Troubleshooting

### "doctl: command not found"

```bash
# Install doctl
brew install doctl

# Or download from:
# https://docs.digitalocean.com/reference/doctl/how-to/install/
```

### "jq: command not found"

```bash
# Install jq
brew install jq

# Or: apt-get install jq
```

### "API authentication failed"

1. Check your token is valid:
   ```bash
   curl -X GET -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.digitalocean.com/v2/account" | jq .
   ```

2. Generate a new token if needed

3. Ensure token has read+write permissions

### "SSH key not found"

```bash
# List your SSH keys
doctl compute ssh-key list

# Use the ID column as DO_SSH_KEY_ID
```

### "Droplet creation failed"

1. Check the log file in `logs/`
2. Verify region supports your chosen size
3. Check account limits/quotas
4. Try a different region

### "Cloud-init not running"

```bash
# SSH into droplet
ssh root@<droplet-ip>

# Check cloud-init status
cloud-init status

# View logs
cat /var/log/cloud-init-output.log
```

---

## 🧹 Cleanup

### Delete Specific Droplet

```bash
# Using doctl
doctl compute droplet delete <droplet-id>

# Using API
curl -X DELETE \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/droplets/<droplet-id>"
```

### Delete All Tagged Droplets

```bash
# Delete all droplets with 'gpu-demo' tag
doctl compute droplet delete --tag-name gpu-demo

# Confirm before deletion
doctl compute droplet list --tag-name gpu-demo
```

### Clean Up Logs

```bash
# Remove old logs
rm logs/*.log

# Or keep recent logs only
find logs/ -name "*.log" -mtime +7 -delete
```

---

## 📚 Additional Resources

### DigitalOcean Documentation
- [API Documentation](https://docs.digitalocean.com/reference/api/)
- [doctl Reference](https://docs.digitalocean.com/reference/doctl/)
- [Cloud-Init Guide](https://cloudinit.readthedocs.io/)
- [GPU Droplets](https://docs.digitalocean.com/products/gpu-droplets/)

### Pricing
- [Droplet Pricing](https://www.digitalocean.com/pricing)
- [GPU Droplet Pricing](https://www.digitalocean.com/products/gpu-droplets)

### Support
- [DigitalOcean Community](https://www.digitalocean.com/community)
- [Support Portal](https://www.digitalocean.com/support)

---

## 🔄 Advanced Usage

### Custom Cloud-Init

Edit `cloudinit_userdata.yaml` to customize:

```yaml
# Add custom packages
packages:
  - your-package-here

# Add custom scripts
runcmd:
  - your-command-here
```

### Using with CI/CD

```bash
# Example GitHub Actions workflow
- name: Create test droplet
  run: |
    export DIGITALOCEAN_TOKEN=${{ secrets.DO_TOKEN }}
    export DO_SSH_KEY_ID=${{ secrets.DO_SSH_KEY_ID }}
    ./digitalocean/create_do_api.sh ci-test s-2vcpu-4gb
```

### Parallel Droplet Creation

```bash
# Create multiple droplets in parallel
for i in {1..5}; do
    ./create_do_gpu.sh "parallel-test-${i}" s-2vcpu-4gb &
done
wait

# View all created droplets
./show_droplet_info.sh
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All scripts are executable (`chmod +x *.sh`)
- [ ] Environment variables are set
- [ ] doctl CLI is authenticated
- [ ] SSH keys are uploaded to DigitalOcean
- [ ] Test droplet creation succeeds
- [ ] Cloud-init completes successfully
- [ ] Logs are created in `logs/` directory
- [ ] Can view droplet info
- [ ] Can SSH into created droplets
- [ ] Demo workload runs successfully

---

## 📝 License

These scripts are provided as-is for educational and testing purposes.

## 🤝 Contributing

Feel free to modify and extend these scripts for your needs!

---

**Happy cloud computing! 🚀**

