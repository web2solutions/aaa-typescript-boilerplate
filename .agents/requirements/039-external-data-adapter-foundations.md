# Requirement 039 - External Data Adapter Foundations

## Context
The boilerplate must provide explicit repository adapter foundations for relational and NoSQL integrations.

## Rules
1. Provide repository classes/foundations for:
   - Sequelize SQL (PostgreSQL, MySQL, SQL Server, Oracle, SQLite)
   - Mongoose (MongoDB)
   - DynamoDB (AWS SDK ecosystem)
   - Cassandra
   - Firebase
   - Aurora (Amazon)
   - RDS (Amazon)
2. Foundations must not force hard runtime coupling when providers are unused.
3. Provider adapters must remain behind ports/contracts.

## Implementation Notes
- Initial foundations live in `src/infra/persistence/external/`.
