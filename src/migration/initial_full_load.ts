import {sync_category_table} from "./load_sync_category";
import {sync_film_table} from "./load_sync_film";
import {sync_actor_table} from "./load_sync_actor";
import {sync_store_table} from "./load_sync_store";
import {sync_rental_table} from "./load_sync_rental";
import {sync_customer_table} from "./load_sync_customer";
import {sync_payment_table} from "./load_sync_payment";
import {sync_bridge_film_category_table} from "./load_sync_bridge_film_category";
import {sync_bridge_film_actor_table} from "./load_sync_bridge_film_actor";

export async function initial_full_load(): Promise<void> {
    console.log("initial_full_load started.");

    await sync_category_table();
    console.log("categories loaded");

    await sync_film_table();
    console.log("films loaded");

    await sync_actor_table();
    console.log("actors loaded");

    await sync_store_table();
    console.log("stores loaded");

    await sync_customer_table();
    console.log("customers loaded");

    await sync_rental_table();
    console.log("rentals loaded");

    await sync_payment_table();
    console.log("payments loaded");

    await sync_bridge_film_category_table();
    console.log("bridge_film_category loaded");

    await sync_bridge_film_actor_table();
    console.log("bridge_film_actor loaded");

    console.log("initial_full_load Finished!!!");
}
