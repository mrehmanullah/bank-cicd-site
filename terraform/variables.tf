variable "region" { default = "ap-south-1" }
variable "cluster_name" { default = "rqbank-eks" }
variable "k8s_version" { default = "1.31" } # use a version EKS currently supports (check EKS console)
variable "github_repo" { description = "GitHub user/repo, e.g. jane/rqbank" }