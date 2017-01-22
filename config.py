# DATABASE SETTINGS
pg_db_username = 'lgoerl'
pg_db_password = 'pg34vn00'
pg_db_instancename = 'lgoerlsandbox'
pg_db_hostname = 'co0kbuzosniz.us-west-1.rds.amazonaws.com'
pg_db_name = 'StravaRoutesTest'

# PostgreSQL
SQLALCHEMY_DATABASE_URI = "postgresql://{DB_USER}:{DB_PASS}@{DB_INST}.{DB_ADDR}:5432/{DB_NAME}?sslca=rds-ssl-ca-cert.pem&sslmode=require&encrypt=true".format(DB_USER=pg_db_username,
                                                                                        DB_PASS=pg_db_password,
                                                                                        DB_INST=pg_db_instancename,
                                                                                        DB_ADDR=pg_db_hostname,
                                                                                        DB_NAME=pg_db_name)