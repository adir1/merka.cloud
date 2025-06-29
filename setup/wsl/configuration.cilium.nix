# Edit this configuration file to define what should be installed on
# your system. Help is available in the configuration.nix(5) man page, on
# https://search.nixos.org/options and in the NixOS manual (`nixos-help`).

# NixOS-WSL specific options are documented on the NixOS-WSL repository:
# https://github.com/nix-community/NixOS-WSL

{ config, lib, pkgs, ... }:

{
  imports = [
    # include NixOS-WSL modules
    <nixos-wsl/modules>
  ];

  wsl.enable = true;
  wsl.defaultUser = "nixos";
  
  networking.hostName = "merka-master"; # Or your desired hostname

  time.timeZone = "Etc/UTC";

  # Enable the firewall. k3s and Cilium modules will open necessary ports.
  # networking.firewall.enable = true;

  # Ensure WireGuard kernel module is loaded and tools are available
  boot.kernelModules = [ "wireguard" ];
  environment.systemPackages = [ pkgs.wireguard-tools ];

  # Kubernetes (k3s) Control Plane Configuration
  services.k3s = {
    enable = true;
    role = "server"; # This node will be a control-plane server
    # By default, k3s server role uses embedded SQLite if 'extraFlags' for datastore endpoint isn't set.
    # To make it even more minimal and ready for your custom components,
    # you might want to disable some default k3s add-ons:
    extraFlags = [
      "--disable=traefik"      # If you have your own ingress
      "--disable=servicelb"    # If you have your own load balancer solution
      "--disable=metrics-server" # If you use a different metrics solution
      "--flannel-backend=none" # Disable k3s default CNI (Flannel)
      "--disable-network-policy" # Let Cilium handle network policies
      "--disable=kube-proxy"   # Let Cilium handle kube-proxy duties with eBPF
    ];
  };

  # Cilium CNI Configuration
  services.cilium = {
    enable = true;
    # Let Cilium manage kube-proxy functionalities using eBPF.
    # "strict" mode ensures kube-proxy is not running.
    enableKubeProxyReplacement = "strict";
    # Enable eBPF-based masquerading for outgoing traffic from pods.
    enableBpfMasquerade = true;
    # Disable default Cilium tunneling (VXLAN/Geneve) as WireGuard will handle encryption/encapsulation.
    tunnel = "disabled";
    # Enable WireGuard for transparent encryption of pod-to-pod traffic.
    encryption = {
      enabled = true;
      type = "wireguard";
    };
    # Optional: Enable Hubble for network observability
    hubble = {
      enable = true;
      ui.enable = true;
      relay.enable = true;
    };
  };

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It's perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "24.11"; # Did you read the comment?

}
  