terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "truckbiz-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "truckbiz-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "truckbiz"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

module "ecr" {
  source        = "../../modules/ecr"
  app_name      = var.app_name
  environment   = var.environment
  ecr_repo_name = var.ecr_repo_name
}

module "vpc" {
  source      = "../../modules/vpc"
  app_name    = var.app_name
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  aws_region  = var.aws_region
}

module "eks" {
  source             = "../../modules/eks"
  app_name           = var.app_name
  environment        = var.environment
  eks_cluster_name   = var.eks_cluster_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "rds" {
  source             = "../../modules/rds"
  app_name           = var.app_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password        = var.db_password
}

variable "aws_region"       { default = "us-east-1" }
variable "environment"      { default = "dev" }
variable "app_name"         { default = "truckbiz" }
variable "ecr_repo_name"    { default = "truckbiz" }
variable "eks_cluster_name" { default = "truckbiz-eks-dev" }
variable "vpc_cidr"         { default = "10.0.0.0/16" }
variable "db_password"      { sensitive = true }

output "ecr_repo_url"         { value = module.ecr.ecr_repo_url }
output "eks_cluster_endpoint" { value = module.eks.cluster_endpoint }
output "vpc_id"               { value = module.vpc.vpc_id }
output "rds_endpoint"         { value = module.rds.db_endpoint }
