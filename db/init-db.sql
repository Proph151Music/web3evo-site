-- Provide the 'admin' user with root-level privileges
-- This is required if we intend to keep the database URL as "mysql://admin:password@db:3306/app_db_prod"
-- We can remove this script if we change the URL to "mysql://root:password@db:3306/app_db_prod"
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

