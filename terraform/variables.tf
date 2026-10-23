variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to deploy resources"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev/prod)"
}

variable "app_name" {
  type        = string
  default     = "truckbiz"
  description = "Application name used for resource naming"
}

variable "ecr_repo_name" {
  type        = string
  default     = "truckbiz"
  description = "Base name for ECR repositories"
}

variable "eks_cluster_name" {
  type        = string
  default     = "truckbiz-eks"
  description = "Name of the EKS cluster"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for the VPC"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS master password"
}
