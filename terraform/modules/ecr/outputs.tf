output "ecr_repo_url" {
  description = "Backend ECR repo URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repo_url" {
  description = "Frontend ECR repo URL"
  value       = aws_ecr_repository.frontend.repository_url
}
