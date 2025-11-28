# K3s on macOS with Tailscale (Lima + Debian)

This directory contains scripts to set up a dedicated K3s Kubernetes cluster on macOS using [Lima](https://github.com/lima-vm/lima) (Linux on Mac) and [Tailscale](https://tailscale.com/).

It uses Apple's native **Virtualization.framework** (`vz`) and a **Debian 12** image.

## Prerequisites

- **macOS** (Apple Silicon recommended for best performance)
- **Homebrew**
- **Tailscale Account**

## Quick Start

### 1. Create Control Plane

```bash
# Option A: Interactive Tailscale login
./create-cluster.sh

# Option B: Automated (Recommended)
export TAILSCALE_AUTH_KEY="tskey-auth-..."
./create-cluster.sh
```

This will:
1. Install `lima` if missing.
2. Launch a Debian VM named `k3s-debian` defined in `k3s-debian.yaml`.
3. Install Tailscale and K3s inside the VM.
4. Generate a `k3s.yaml` kubeconfig pointing to the Tailscale IP.

### 2. Access the Cluster

```bash
export KUBECONFIG=$(pwd)/k3s.yaml
kubectl get nodes
```

### 3. Add Worker Nodes

Use the `join-node.sh` script on other Linux machines/VMs connected to the same Tailnet.

1. Get Token:
   ```bash
   limactl shell k3s-debian sudo cat /var/lib/rancher/k3s/server/node-token
   ```
2. Get IP:
   ```bash
   limactl shell k3s-debian tailscale ip -4
   ```
3. Join:
   ```bash
   ./join-node.sh <CONTROL_PLANE_IP> <NODE_TOKEN>
   ```
