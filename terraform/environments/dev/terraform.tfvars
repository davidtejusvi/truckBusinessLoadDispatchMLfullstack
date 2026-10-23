aws_region       = "us-east-1"
environment      = "dev"
app_name         = "truckbiz"
ecr_repo_name    = "truckbiz"
eks_cluster_name = "truckbiz-eks-dev"
vpc_cidr         = "10.0.0.0/16"
# db_password is set via TF_VAR_db_password environment variable or AWS Secrets Manager
