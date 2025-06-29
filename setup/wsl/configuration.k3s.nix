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

  time.timeZone = "America/New_York";

  # Enable the firewall. k3s and Cilium modules will open necessary ports.
  # networking.firewall.enable = true;

  # Ensure WireGuard kernel module is loaded and tools are available
  boot.kernelModules = [ "wireguard" ];
  environment.systemPackages = [
    pkgs.kubectl         # Kubernetes command-line tool
    pkgs.wireguard-tools
    pkgs.garage          # Garage S3-compatible distributed object storage
    pkgs.openssl         # OpenSSL command-line tool and libraries
    pkgs.kubernetes-helm # Helm client
  ];

  # Configure Garage to auto-start with systemd
  systemd.services.garage = {
    description = "Garage Distributed Object Storage Server";
    # Start after network is online and WSL setup (which includes disk mounting) is complete.
    after = [ "network-online.target" ];
    wants = [ "network-online.target" ];
    # Enable the service to be started at boot within the multi-user environment.
    wantedBy = [ "multi-user.target" ];

    serviceConfig = {
      Type = "simple";
      # The garage server command.
      # It's recommended to use a configuration file, e.g., /etc/garage.toml.
      # You will need to create this configuration file.
      ExecStart = "${pkgs.garage}/bin/garage server";
      Restart = "on-failure";
      # StateDirectory=garage;
      # DynamicUser=true;
      # ProtectHome=true;
      # NoNewPrivileges=true;
      LimitNOFILE=42000;
      # Consider running garage as a dedicated user for better security.
      # User = "nixos";
      # Group = "garage";
    };
  };

  # Kubernetes (k3s) Control Plane Configuration
  services.k3s = {
    enable = true;
    role = "server"; # This node will be a control-plane server
    # By default, k3s server role uses embedded SQLite if 'extraFlags' for datastore endpoint isn't set.
    # To make it even more minimal and ready for your custom components,
    # you might want to disable some default k3s add-ons:
    extraFlags = [
      # "--disable=traefik"                 # Disable built-in ingress controller
      "--disable=servicelb"               # Disable built-in Klipper LoadBalancer
      # "--disable=metrics-server"        # Re-enable built-in metrics server
      "--flannel-backend=wireguard-native"  # Use WireGuard for Flannel pod network encryption
      # "--disable=local-storage"         # Re-enable local-path-provisioner for hostPath PVs
      "--disable-network-policy"          # Disable K3s network policy controller (Flannel doesn't enforce policies)
      "--write-kubeconfig-mode=0644"      # Set kubeconfig permissions to be readable by user
      "--secrets-encryption"              # Encrypt at rest the secrets of this cluster
    ];
  };

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It's perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "24.11"; # Did you read the comment?

}
  