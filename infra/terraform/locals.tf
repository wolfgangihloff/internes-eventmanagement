locals {
  network_zone_by_location = {
    ash  = "us-east"
    hil  = "us-west"
    fsn1 = "eu-central"
    nbg1 = "eu-central"
    hel1 = "eu-central"
    sin  = "ap-southeast"
  }

  network_zone = local.network_zone_by_location[var.location]

  common_labels = {
    app        = var.cluster_name
    managed_by = "terraform"
    stack      = "k3s"
  }
}
