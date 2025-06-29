# c:/git/merka.cloud/setup/wsl/configuration.podman-gvisor.nix
#
# NixOS configuration for WSL with Podman, Podman Compose, and gVisor.
#
# To use this:
# 1. Place this file at /etc/nixos/configuration.nix on your NixOS on WSL instance.
# 2. Run `sudo nixos-rebuild switch` to apply the configuration.

{ config, lib, pkgs, ... }:

{
  imports = [
    # include NixOS-WSL modules
    <nixos-wsl/modules>
  ];

  # Enable NixOS on WSL
  wsl.enable = true;
  wsl.defaultUser = "nixos";

  # Set a hostname
  networking.hostName = "merka-podman-gvisor";

  # Set your time zone
  time.timeZone = "America/New_York";

  # Define packages to be installed system-wide.
  environment.systemPackages = [
    pkgs.podman
    pkgs.podman-compose
    pkgs.openssl         # Generally useful tool
    pkgs.tailscale
  ];

  # Configure Podman and gVisor
  virtualisation = {
    # This ensures gVisor is installed and available.
    gvisor.enable = true;

    podman = {
      enable = true;
      # Set the default OCI runtime to 'runsc' (gVisor).
      # This ensures that all containers, including those started with
      # podman-compose, will use gVisor by default for enhanced security.
      defaultRuntime = "runsc";

      # Define the 'runsc' runtime for Podman.
      settings.engine.runtimes = {
        # The key 'runsc' is the name we use to refer to this runtime.
        # The value is the path to the gVisor runtime binary.
        runsc = [ "${pkgs.gvisor}/bin/runsc" ];
      };
    };
  };

  # Enable Tailscale for secure networking.
  # After rebuilding, run `sudo tailscale up` to connect to your tailnet.
  services.tailscale.enable = true;

  # This value determines the NixOS release from which the default settings
  # for stateful data were taken. It's recommended to leave this value as is.
  system.stateVersion = "24.11"; # Did you read the comment?
}