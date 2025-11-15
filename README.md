# Project Setup

1. Start by cloning the Git repository.
2. Run `npm i` command inside the root directory(ORM-Data-Sync-Process).
3. add .env file with following details. Put .env file in the root directory
    - USERNAME = root
    - PASSWORD = <password>
    - HOST = localhost
    - PORT = <PORT>
    - DATABASE = <database-name>
    - OUTGOING_DATABASE = <second-database>
4. Run `npm start` command.

# Using the CLI:

1. Run `npm i` command the root directory.
2. Run this command in terminal: `npm run build`
3. Next, make `cli.js` inside `build` executable using:  
   `chmod +x build/cli.js`
4. Register CLI globally using:  
   `npm link`
5. Check if the registration was successful with:  
   `which orm-cli`
6. Type `orm-cli` and hit enter to run the CLI
7. Now, you have access to the following commands:
    1. `init`
    2. `full-load`
    3. `incremental`
    4. `validate`
    5. `exit`

# Project Design and Feature

## Schema
The following schema are part of the project model:
### MYSQL - sakila database
1. Actor
2. Address
3. Category
4. City
5. Country
6. Customer
7. Film
8. Film_Actor
9. Film_Category
10. Inventory
11. Rental
12. Staff
13. Store
14. Language
15. Payment

### Sqlite schema has the following entities

### `dim_date`
Stores calendar and derived date attributes for time-based aggregation.

| date_key | date       | year | quarter | month | day_of_month | day_of_week | is_weekend |
|----------|------------|------|---------|-------|--------------|------------|------------|
| 20060214 | 2006-02-14 | 2006 | 1       | 2     | 14           | 2          | 0          |

---

### `dim_film`
Represents individual films with descriptive attributes.

| film_key | film_id | title         | rating | length | language | release_year | last_update |
|----------|--------|---------------|--------|--------|----------|--------------|-------------|
| 25801    | 258    | CHICAGO NORTH | PG     | 107    | English  | 2005         | 2006-02-15  |

---

### `dim_actor`
Contains actor details used for film-level analysis.

| actor_key | actor_id | first_name | last_name | last_update |
|-----------|----------|------------|-----------|-------------|
| 50101     | 101      | JENNIFER   | DAVIS     | 2006-02-15  |

---

### `dim_category`
Stores film categories or genres.

| category_key | category_id | name  | last_update |
|--------------|-------------|-------|-------------|
| 30101        | 10          | DRAMA | 2006-02-15  |

---

### `dim_store`
Holds store-level location details to analyze performance by geography.

| store_key | store_id | city       | country | last_update |
|-----------|----------|------------|---------|-------------|
| 1001      | 1        | Lethbridge | Canada  | 2006-02-15  |

---

### `dim_customer`
Captures customer attributes to support customer-based analytics.

| customer_key | customer_id | first_name | last_name | active | city   | country | last_update |
|--------------|------------|------------|-----------|--------|--------|---------|-------------|
| 34101        | 341        | BRENDA     | BROWN     | 1      | Dallas | USA     | 2006-02-15  |

---

## Bridge Tables (Many-to-Many)

### `bridge_film_actor`
Links films and actors to support analysis of actor participation.

| film_key | actor_key |
|----------|-----------|
| 25801    | 50101     |

---

### `bridge_film_category`
Links films and categories to support genre-level insights.

| film_key | category_key |
|----------|--------------|
| 25801    | 30101        |

---

## Fact Tables

### `fact_rental`
Records each rental event. Enables analysis of rental behavior, duration, and store activity.

| fact_rental_key | rental_id | date_key_rented | date_key_returned | film_key | store_key | customer_key | staff_id | rental_duration_days |
|-----------------|-----------|----------------|-----------------|---------|----------|--------------|---------|--------------------|
| 50001           | 16050     | 20060214       | 20060219        | 25801   | 1001     | 34101        | 2       | 5                  |

---

### `fact_payment`
Tracks payment transactions and supports revenue analysis.

| fact_payment_key | payment_id | date_key_paid | customer_key | store_key | staff_id | amount |
|-----------------|-----------|---------------|--------------|----------|---------|--------|
| 80001           | 17503     | 20060219      | 34101        | 1001     | 2       | 6.99   |

## Additional tables

### `sync_log`
Tracks details of each synchronization event, including counts and discrepancies between source and target tables.

| Column               | Type        | Description                                                     |
|----------------------|-------------|-----------------------------------------------------------------|
| source_target_key    | int (PK)    | Auto-generated primary key for each sync log entry              |
| sync_date            | datetime    | Timestamp when the sync occurred                                |
| source_table_name    | varchar(100)| Name of the source table synced                                 |
| target_table_name    | varchar(100)| Name of the target table receiving data                         |
| source_records_count | int         | Number of records found in the source table                     |
| target_records_count | int         | Number of records written to the target table                   |
| records_difference   | int         | Difference between source and target counts                     |
| sync_status          | varchar(20) | Status of sync (`success`, `warning`, `error`)                  |

**Example Row**

| source_target_key | sync_date           | source_table_name | target_table_name | source_records_count | target_records_count | records_difference | sync_status |
|-------------------|---------------------|-------------------|--------------------|-----------------------|-----------------------|--------------------|-------------|
| 1                 | 2025-01-27 12:30:00 | actor             | dim_actor          | 200                  | 200                   | 0                  | success     |

---
### `sync_table`
Stores the last successful sync timestamp for every table in the ETL pipeline.

| Column         | Type        | Description                                           |
|----------------|-------------|-------------------------------------------------------|
| sync_key       | int (PK)    | Auto-generated primary key                            |
| table_name     | varchar     | Name of the table being tracked                       |
| last_sync_time | datetime    | Last time an incremental or full sync was completed   |

**Example Row**

| sync_key | table_name | last_sync_time        |
|----------|------------|------------------------|
| 1        | actor      | 2025-01-27 12:30:00    |

## Features

The CLI provides the following four commands:

### `init`

This command initializes the databases. In the project, the source is MySql database and the target is Sqlite.(file: init.ts)

### `full-load`

This command ensures that all the sakila data from MySql database is loaded and added to Sqlite database. (file: full-load.ts)

### `validate`

This command compares the # of records in source and target database. Each run create an entry into the table sync_log.
(file: validate.ts)

### `incremental`

This command starts a sync. For each table, we look at the time at which the last sync ran. The data post that date is 
pulled form the source database and then added/update in the target database.

(file: incremental.ts)

## Limitation
The user is advised to run the `init` and `full-load` commands in a sequence. After that, they can run the remaining two
commands in any order.
