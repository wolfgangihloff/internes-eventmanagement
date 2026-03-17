output "cluster_name" {
  value = var.cluster_name
}

output "location" {
  value = var.location
}

output "network_id" {
  value = hcloud_network.cluster.id
}

output "server_public_ipv4" {
  value = hcloud_server.control_plane.ipv4_address
}

output "server_public_ipv6" {
  value = hcloud_server.control_plane.ipv6_address
}

output "server_private_ipv4" {
  value = var.server_private_ipv4
}

output "ssh_user" {
  value = "root"
}

output "ssh_command" {
  value = "ssh root@${hcloud_server.control_plane.ipv4_address}"
}
