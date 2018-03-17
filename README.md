# Suricats API

An API developed in NodeJS meant to be the referential of *suricats consulting*

## Installing project under linux

Note: the installation has been tested on Ubuntu 16.04 and node 9.0.0

Prerequisites : `have node and npm installed`

1. Clone and open project
2. Install project's dependencies
```bash
npm install
```
3. Install foreverjs if you don't have this library locally [see more](https://github.com/foreverjs/forever)
```bash
sudo npm install forever -g
```
4. Run the project
```bash
DB_HOST=<db_host> DB_NAME=<db_name> DB_USER=<db_user> DB_PASSWORD=<db_password> DB_PORT=<db_port> API_PORT=<api_port> SECRET_TOKEN=<secret_token> forever app.js
```

## Database

We use **MySQL server**.

You will find the detail of each table in the file docs/mysql_dump.txt. Use the scripts in order to have the expected structure.

Furthermore, use the collection postman (cf. docs/postman) to perform an *IMPORT_SURICAT* using the CSV file docs/annuaire_test.csv.

Note : during the creation of structure, you may have this "ERROR 1067 (42000): Invalid default value for...". In order to fix this issue, you need to connect to the database :

1. Check sql_mode value
```bash
show variables like 'sql_mode';
```
2. Remove "NO_ZERO_IN_DATE,NO_ZERO_DATE"
```bash
SET GLOBAL sql_mode = "ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";
```

## Authors

* **Suricats Consulting** - [website](http://www.suricats-consulting.com/)
