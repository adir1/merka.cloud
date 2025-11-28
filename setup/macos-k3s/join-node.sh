#!/bin/bash
set -e

# Usage: ./join-node.sh <CONTROL_PLANE_IP> <NODE_TOKEN>
# Example: ./join-node.sh 100.x.y.z K10...

CONTROL_PLANE_IP=$1
NODE_TOKEN=$2
K3S_VERSION="v1.28.4+k3s2"

if [ -z "$CONTROL_PLANE_IP" ] || [ -z "$NODE_TOKEN" ]; then
    echo "Usage: $0 <CONTROL_PLANE_IP> <NODE_TOKEN>"
    echo "You can get the token from the control plane: sudo cat /var/lib/rancher/k3s/server/node-token"
    exit 1
fi

echo "Joining K3s cluster at $CONTROL_PLANE_IP..."

# 1. Install Tailscale (if not present)
if ! command -v tailscale &> /dev/null; then
    echo "Installing Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh
    echo "Please authenticate Tailscale:"
    sudo tailscale up
fi

# Get local Tailscale IP
TS_IP=$(tailscale ip -4)
echo "Local Tailscale IP: $TS_IP"

# 2. Install K3s Agent
echo "Installing K3s Agent..."
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=$K3S_VERSION sh -s - agent \
    --server "https://${CONTROL_PLANE_IP}:6443" \
    --token "$NODE_TOKEN" \
    --node-ip "$TS_IP" \
    --flannel-iface tailscale0

echo "Node joined successfully!"
