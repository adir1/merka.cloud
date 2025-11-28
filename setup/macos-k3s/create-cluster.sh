#!/bin/bash
set -e

# Configuration
LIMA_INSTANCE="k3s-debian"
CONFIG_FILE="k3s-debian.yaml"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting K3s Cluster Setup on macOS with Lima (Debian) and Tailscale...${NC}"

# 1. Check/Install Lima
if ! command -v limactl &> /dev/null; then
    echo "Lima not found. Installing via Homebrew..."
    brew install lima
else
    echo -e "${GREEN}Lima is already installed.${NC}"
fi

# 2. Start VM
if limactl list | grep -q "$LIMA_INSTANCE"; then
    echo -e "${BLUE}Instance '$LIMA_INSTANCE' already exists.${NC}"
    STATUS=$(limactl list $LIMA_INSTANCE --json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" != "Running" ]; then
        echo "Starting instance..."
        limactl start $LIMA_INSTANCE
    fi
else
    echo -e "${BLUE}Creating and starting instance '$LIMA_INSTANCE'...${NC}"
    # Pass TAILSCALE_AUTH_KEY if set
    if [ -n "$TAILSCALE_AUTH_KEY" ]; then
        echo "Injecting TAILSCALE_AUTH_KEY..."
        limactl start --name=$LIMA_INSTANCE --set "env.TAILSCALE_AUTH_KEY=$TAILSCALE_AUTH_KEY" ./$CONFIG_FILE
    else
        echo "No TAILSCALE_AUTH_KEY detected. You will need to authenticate manually."
        limactl start --name=$LIMA_INSTANCE ./$CONFIG_FILE
    fi
fi

# 3. Verify Tailscale
echo -e "${BLUE}Checking Tailscale status...${NC}"
TS_STATUS=$(limactl shell $LIMA_INSTANCE sudo tailscale status --json | grep -o '"BackendState":"[^"]*"' | cut -d'"' -f4)

if [ "$TS_STATUS" != "Running" ]; then
    echo -e "${BLUE}Tailscale is not connected. Please authenticate:${NC}"
    limactl shell $LIMA_INSTANCE sudo tailscale up
fi

TS_IP=$(limactl shell $LIMA_INSTANCE tailscale ip -4)
echo -e "${GREEN}Tailscale IP: $TS_IP${NC}"

# 4. Extract Kubeconfig
echo -e "${BLUE}Extracting kubeconfig...${NC}"
limactl shell $LIMA_INSTANCE sudo cat /etc/rancher/k3s/k3s.yaml > k3s.yaml

# Replace localhost/127.0.0.1 with Tailscale IP
sed -i '' "s/127.0.0.1/$TS_IP/g" k3s.yaml
chmod 600 k3s.yaml

echo -e "${GREEN}Cluster setup complete!${NC}"
echo -e "You can access the cluster using: ${BLUE}export KUBECONFIG=$(pwd)/k3s.yaml${NC}"
echo -e "Verify with: ${BLUE}kubectl get nodes${NC}"
