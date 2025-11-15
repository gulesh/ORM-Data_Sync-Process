import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from "dotenv";
import {actor} from "./entity/actor";
import {address} from "./entity/address";
import {category} from "./entity/category";
import {city} from "./entity/city";
import {customer} from "./entity/customer";
import {country} from "./entity/country";
import {film} from "./entity/film";
import {film_actor} from "./entity/film_actor";
import {film_category} from "./entity/film_category";
import {language} from "./entity/language";
import {inventory} from "./entity/inventory";
import {payment} from "./entity/payment";
import {rental} from "./entity/rental";
import {staff} from "./entity/staff";
import {store} from "./entity/store";
import {dim_actor} from "./entity/dim_actor";
import {dim_category} from "./entity/dim_category";
import {dim_customer} from "./entity/dim_customer";
import {dim_date} from "./entity/dim_date";
import {dim_store} from "./entity/dim_store";
import {fact_rental} from "./entity/fact_rental";
import {dim_film} from "./entity/dim_film";
import {fact_payment} from "./entity/fact_payment";
import {bridge_film_actor} from "./entity/bridge_film_actor";
import {bridge_film_category} from "./entity/bridge_film_category";
import {sync_table} from "./entity/sync_table";
import {sync_log} from "./entity/sync_log";

dotenv.config();

export const incomingSourceDB = new DataSource({
    type: "mysql",
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: false,
    timezone: "Z",
    logging: false,
    entities: [actor, address, category, city, country, customer, film, film_actor, film_category, inventory, language,
        payment, rental, staff, store],
    migrations: [],
    subscribers: [],
})

export const outgoingSourceDB = new DataSource({
    type: "sqlite",
    database: process.env.OUTGOING_DATABASE,
    synchronize: true,
    logging: false,
    entities: [dim_actor, dim_category, dim_customer, dim_date, dim_film, dim_store, fact_payment, fact_rental, bridge_film_actor
    , bridge_film_category, sync_table, sync_log],
    migrations: [],
    subscribers: [],
})