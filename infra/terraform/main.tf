resource "random_password" "k3s_token" {
  length  = 48
  special = false
}

resource "hcloud_network" "cluster" {
  name     = "${var.cluster_name}-net"
  ip_range = var.private_network_cidr
  labels   = local.common_labels
}

resource "hcloud_network_subnet" "cluster" {
  network_id   = hcloud_network.cluster.id
  type         = "cloud"
  network_zone = local.network_zone
  ip_range     = var.private_subnet_cidr
}

resource "hcloud_ssh_key" "cluster_admin" {
  name       = "${var.cluster_name}-admin"
  public_key = trimspace(var.ssh_public_key)
  labels     = local.common_labels
}

resource "hcloud_server" "control_plane" {
  name        = "${var.cluster_name}-cp-1"
  image       = var.image
  server_type = var.server_type
  location    = var.location
  ssh_keys    = [hcloud_ssh_key.cluster_admin.id]
  user_data = templatefile("${path.module}/templates/k3s-server-cloud-init.yaml.tftpl", {
    cluster_name = var.cluster_name
    k3s_channel  = var.k3s_channel
    k3s_token    = random_password.k3s_token.result
  })
  labels = merge(local.common_labels, {
    role = "control-plane"
  })

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}

resource "hcloud_server_network" "control_plane" {
  server_id  = hcloud_server.control_plane.id
  network_id = hcloud_network.cluster.id
  ip         = var.server_private_ipv4

  depends_on = [hcloud_network_subnet.cluster]
}

resource "hcloud_firewall" "cluster" {
  name   = "${var.cluster_name}-firewall"
  labels = local.common_labels

  rule {
    direction  = "in"
    protocol   = "icmp"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = var.ssh_allowed_cidrs
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "6443"
    source_ips = var.kube_api_allowed_cidrs
  }

  apply_to {
    server = hcloud_server.control_plane.id
  }
}
