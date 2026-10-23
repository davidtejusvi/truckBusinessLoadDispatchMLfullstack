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
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "truckbiz-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = var.app_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "ecr" {
  source        = "./modules/ecr"
  app_name      = var.app_name
  environment   = var.environment
  ecr_repo_name = var.ecr_repo_name
}

module "vpc" {
  source      = "./modules/vpc"
  app_name    = var.app_name
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  aws_region  = var.aws_region
}

module "eks" {
  source             = "./modules/eks"
  app_name           = var.app_name
  environment        = var.environment
  eks_cluster_name   = var.eks_cluster_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "rds" {
  source             = "./modules/rds"
  app_name           = var.app_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password        = var.db_password
}
