output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}
