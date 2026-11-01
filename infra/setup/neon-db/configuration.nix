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
  
  networking.hostName = "merka-neondb"; # Or your desired hostname

  time.timeZone = "America/New_York";

  # Define the packages to be installed system-wide
  environment.systemPackages = with pkgs; [
    libtool              # GNU Libtool
    autoconf             # GNU Autoconf
    automake             # GNU Automake
    readline             # GNU Readline library (with dev files)
    zlib                 # Compression library (with dev files)
    flex                 # Fast lexical analyzer generator
    bison                # Parser generator
    libseccomp           # Interface to the Linux kernel's seccomp filter (with dev files)
    openssl              # Cryptography and SSL/TLS Toolkit (with dev files)
    clang                # C language family frontend for LLVM
    pkg-config           # Helper tool used when compiling applications and libraries
    postgresql           # PostgreSQL database (includes client and libpq)
    cmake                # Cross-platform build system generator
    protobuf             # Protocol Buffers - Google's data interchange format (includes compiler and libs)
    curl                 # Command line tool and library for transferring data with URLs
    poetry               # Python dependency management and packaging tool
    lsof                 # LiSt Open Files
    icu                  # International Components for Unicode (with dev files)
    rustc                # Rust programming language compiler
    cargo                # Rust package manager and build system
    git
    gnumake              # GNU Make utility
    perl                 # Perl programming language (often used by build systems like PostgreSQL's)
  ];

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It's perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "25.05"; # Did you read the comment?

}