aws_region       = "us-east-1"
environment      = "prod"
app_name         = "truckbiz"
ecr_repo_name    = "truckbiz"
eks_cluster_name = "truckbiz-eks-prod"
vpc_cidr         = "10.1.0.0/16"
# db_password is set via TF_VAR_db_password environment variable
