# merka.cloud

Integrated Hyperscaler-Agnostic Cloud

Visit [Merka.Cloud](https://merka.cloud) to learn more.

## Ab-Initio (Installation/Setup)

The best way to get started currently is by using [NixOS](https://nixos.org/)

On Windows - make sure WSL2 is enabled and follow the instructions here: https://github.com/nix-community/NixOS-WSL 

On MacOS - Recommendation is to use OrbStack to add Virtual Machine with NixOS on it: https://docs.orbstack.dev/machines/distros

1. Place setup/wsl/configuration.nix file provided into your /etc/nixos/configuration.nix directory
1. Rebuild the NixOS with new configuration: <code>sudo nixos-rebuild switch</code>
1. Kubernetes K3s configuration file can be found at /etc/rancher/k3s/k3s.yaml , and should be placed on your client machine/host under ~/.kube/config to gain access to newly created cluster


## Setting up additional nodes

Merka supports large variety of nodes and endpoints, and all bring something unique to expand the ecosystem sometimes beyond your expectations.

## Garage - Storage

Nix configuration provided includes an excellect S3 compatible storage implementation - [Garage](https://garagehq.deuxfleurs.fr)
Easiest approach is to follow instructions on their website for setting up S3 storage on same Nix server where K3s master/control plane. You can proceed to add additional nodes and even have it mirror K3s cluster configuration to utilize other Kubernetes nodes for Garage storage network automatically.
Recommended installation location for garage config and server is under /etc/garage.toml
Key commands:
```bash
garage layout assign -z dc1 -c 100G <node_id>
garage layout apply --version 1
garage bucket create merka-cloud-store
garage key create merka-cnpg-bark1
garage bucket allow --read --write --owner merka-cloud-store --key merka-cnpg-bark1
```

We need to upload the generated key to the K3s secrets for future use:
```bash
kubectl create secret generic garage-bark1 \
  -n cnpg \
  --from-literal=ACCESS_KEY_ID=<access key here> \
  --from-literal=ACCESS_SECRET_KEY=<secret key here>
kubectl apply -f setup/cloudnative-pg/barman-objectstore.yaml
kubectl apply -f setup/cloudnative-pg/barman-backup.yaml
```

## Experimental Steps

1. Enable persistent storage on your K3s cluster using 
1. Install Portainer using Helm on your K3s cluster: https://github.com/portainer/k8s/blob/master/charts/portainer/README.md
1. Install Rancher using Helm on your K3s cluster:
1. Connect Neon DB helm chart repo: helm repo add neondatabase https://neondatabase.github.io/helm-charts
1. Install Neon DB various charts: helm search repo neondatabase


### CloudNativePG

1. We will need to install CloudNativePG operator first, using helm: 
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm upgrade --install cnpg \
  --namespace cnpg-system \
  --create-namespace \
  cnpg/cloudnative-pg

1. Next lets create dedicated Namespace for CloudNativePG databases and make it default by running: kubectl create namespace cnpg && kubectl config set-context --current --namespace=cnpg
1. Now deploy /setup/cloudnative-pg/cloudnative-pg.yaml to your K3s cluster using: kubectl apply -f cloudnative-pg.yaml
1. Next we need to add cert-manager.io to our cluster, which has multiple future uses. This can be done via following command: helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.17.2 --set crds.enabled=true
1. Now we are ready to add backup mechanism for our K8s hosted PostgreSQL DB: kubectl apply -f https://github.com/cloudnative-pg/plugin-barman-cloud/releases/download/v0.4.1/manifest.yaml
1. 

Some useful commands:
kubectl get cluster pg1 -n cnpg
kubectl describe cluster pg1 -n cnpg

### Cyclops

Instructions at: https://github.com/cyclops-ui/cyclops


### Portainer

helm upgrade --install --create-namespace -n portainer portainer portainer/portainer \
    --set tls.force=false \
    --set image.tag=sts

helm ls --all-namespaces

### NeonDB

1. Install another Nix WSL or VM, based on setup/neon-db/configuration.nix file
1. Login to NeonDB VM and execute the following:

#### Note: The path to the neon sources can not contain a space.

git clone --recursive https://github.com/neondatabase/neon.git
cd neon

The preferred and default is to make a debug build. This will create a demonstrably slower build than a release build.
For a release build, use "BUILD_TYPE=release make -j`nproc` -s"
Remove -s for the verbose build log

make -j`nproc` -s

## Experimental Step - Karakeep

Complex compose configuration needed, but can be simplified. Uses Ollama reaching out via Tailnet to Mac Mini to execute 12b model for text and vision.

netsh interface portproxy add v4tov4 listenport=3030 listenaddress=0.0.0.0 connectport=3030 connectaddress=100.118.81.71
netsh interface portproxy delete v4tov4 listenport=3030 listenaddress=0.0.0.0
netsh interface portproxy show all

## Ollama setup on MacOs

launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
launchctl setenv OLLAMA_CONTEXT_LENGTH 32000
And then manually restart the Ollama app after. The settings appear to be lost after every reboot.

## Prometheus + Grafana

Instructions from Prometheus Community page: https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack


helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install \
  -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/docs/src/samples/monitoring/kube-stack-config.yaml \
  prometheus-community \
  prometheus-community/kube-prometheus-stack

You should see instructions at the end of that last command, for example:

kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace default get pods -l "release=prometheus-community"
  
Get Grafana 'admin' user password by running:

  kubectl --namespace default get secrets prometheus-community-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

Access Grafana local instance:

  export POD_NAME=$(kubectl --namespace default get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=prometheus-community" -oname)
  kubectl --namespace default port-forward $POD_NAME 3000

Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how to create & configure Alertmanager and Prometheus instances using the Operator.

## Dockge - merka-podman-gvisor

From: https://github.com/louislam/dockge

For this, we are going set up a more secure container Nix instance, using gVisor improved runC. This new instance gets a fun name of merka-podman-gvisor
This instance will also be fully available via TailNet - as it has it's own Tailscale installation.

Start with clean WSL Nix instance and copy configuration.podman-gvisor.nix to /etc/nixos/configuration.nix
Execute:
sudo nixos-rebuild switch

Useful commands:
sudo tailscale up
podman info | grep ociRuntime
podman run --runtime=runc -it --rm alpine
