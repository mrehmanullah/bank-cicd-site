output "ecr_url" { value = aws_ecr_repository.app.repository_url }
output "github_role" { value = aws_iam_role.gh.arn }
output "cluster_name" { value = module.eks.cluster_name }