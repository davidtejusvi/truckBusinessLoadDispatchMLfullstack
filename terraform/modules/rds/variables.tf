variable "app_name" {
  type        = string
  description = "Application name"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID for the RDS security group"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for the DB subnet group"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS master password"
}

variable "db_instance_class" {
  type        = string
  default     = "db.t3.micro"
  description = "RDS instance class"
}
