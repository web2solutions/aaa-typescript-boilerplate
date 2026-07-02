# MySQL Adapter

## Technology

Sequelize + mysql2 profile.

## Build Services with MySQL

1. Start container:

```bash
npm run docker:up:mysql
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=MySQL
AAA_DB_HOST=127.0.0.1
AAA_DB_PORT=3306
AAA_DB_NAME=aaa
AAA_DB_USERNAME=root
AAA_DB_PASSWORD=root
```

3. Start your API adapter.

