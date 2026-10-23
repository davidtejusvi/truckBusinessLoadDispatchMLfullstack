variable "app_name" {
  type        = string
  description = "Application name"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "ecr_repo_name" {
  type        = string
  description = "Base name for ECR repositories"
}
