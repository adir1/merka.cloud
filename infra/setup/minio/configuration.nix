{ config, pkgs, lib, ... }:

{
  imports = [
    # include NixOS-WSL modules
    <nixos-wsl/modules>
  ];

  wsl.enable = true;
  wsl.defaultUser = "minio";
  
  networking.hostName = "merka-minio"; # Or your desired hostname

  time.timeZone = "America/New_York";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";

  # Define a user account.
  # It's highly recommended to use SSH keys for authentication.
  # users.users.nixos = {
  #  isNormalUser = true;
  #  description = "NixOS User";
  #  extraGroups = [ "wheel" ]; # Allows sudo.
  #  openssh.authorizedKeys.keys = [
      # Add your SSH public key here, e.g.:
      # "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHyourPublicKeyHere user@example"
  #  ];
    # Set a password for the user if you don't use SSH keys or need console login.
    # Use `mkpasswd -m sha-512` to generate a hash.
    # initialHashedPassword = "your_hashed_password_here";
  # };

  # It's good practice to disable root login with a password.
  # Root login via SSH can be controlled by services.openssh.settings.PermitRootLogin.
  # users.users.root.initialHashedPassword = ""; # Disables root password login.

  # MinIO S3 Object Store Configuration.
  services.minio = {
    enable = true;
    # User and group for the MinIO service (default: minio:minio).
    # user = "minio";
    # group = "minio";

    # Root user and password for MinIO.
    # IMPORTANT: Create the password file as described in the instructions below.
    rootUser = "minioadmin"; # Choose your MinIO root username.
    rootPasswordFile = "/etc/minio/root-password"; # Path to the file containing the root password.

    # Data directory for MinIO.
    # Default is /var/lib/minio. You can specify one or more paths.
    # dataDir = "/var/lib/minio/data";
    # For multiple drives: dataDir = [ "/mnt/disk1/minio" "/mnt/disk2/minio" ];

    # Network address for the S3 API.
    address = ":9000"; # Default MinIO API port.

    # Network address for the MinIO console.
    consoleAddress = ":9001"; # Default MinIO console port.

    # Region for MinIO (optional).
    # region = "us-east-1";

    # Configuration directory for MinIO (default: /etc/minio).
    # The rootPasswordFile will be placed here.
    # configDir = "/etc/minio";
  };

  # Firewall configuration.
  # Enable the firewall and open ports for SSH and MinIO.
  # networking.firewall = {
  #  enable = true;
  #  allowedTCPPorts = [
  #    22,   # SSH
  #    9000, # MinIO S3 API
  #    9001  # MinIO Console
  #  ];
  # };

  # This value determines the NixOS release from which the default
  # settings for stateful data were taken. It's usually set to the version
  # you installed NixOS with.
  system.stateVersion = "24.11"; # Adjust to your NixOS version.
}