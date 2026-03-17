variable "cluster_name" {
  description = "Prefix used for Hetzner resources."
  type        = string
  default     = "internes-eventmanagement"
}

variable "location" {
  description = "Hetzner location for the k3s node."
  type        = string
  default     = "ash"

  validation {
    condition     = contains(["ash", "hil", "fsn1", "nbg1", "hel1", "sin"], var.location)
    error_message = "location must be one of ash, hil, fsn1, nbg1, hel1, or sin."
  }
}

variable "server_type" {
  description = "Hetzner server type for the k3s node."
  type        = string
  default     = "cpx21"
}

variable "image" {
  description = "Hetzner image for the k3s node."
  type        = string
  default     = "ubuntu-24.04"
}

variable "ssh_public_key" {
  description = "SSH public key content to inject into the server and register in Hetzner."
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "CIDRs allowed to SSH to the node. Tighten this before production use."
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"]
}

variable "kube_api_allowed_cidrs" {
  description = "CIDRs allowed to reach the Kubernetes API. GitHub-hosted runners generally require wide access."
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"]
}

variable "private_network_cidr" {
  description = "Hetzner private network CIDR."
  type        = string
  default     = "10.20.0.0/16"
}

variable "private_subnet_cidr" {
  description = "Hetzner private subnet CIDR."
  type        = string
  default     = "10.20.1.0/24"
}

variable "server_private_ipv4" {
  description = "Private IPv4 to assign to the k3s node inside the Hetzner network."
  type        = string
  default     = "10.20.1.10"
}

variable "k3s_channel" {
  description = "k3s release channel used by the install script."
  type        = string
  default     = "stable"
}
