import {sync_table} from "../entity/sync_table";
import {update_actor_table} from "./sync_actor";
import {update_category_table} from "./sync_category";
import {update_customer_table} from "./sync_customer";
import {update_film_table} from "./sync_film";
import {update_store_table} from "./sync_store";
import {update_payment_table} from "./sync_payment";
import {update_rental_table} from "./sync_rentals";
import {update_bridge_film_actor_table} from "./sync_bridge_film_actor";
import {update_bridge_film_category_table} from "./sync_bridge_film_category";


export async function sync_job(){
    console.log("sync job Starting...");

    await update_actor_table();
    console.log("synced actor table!");

    await update_category_table();
    console.log("synced category table!");

    await update_customer_table();
    console.log("synced customer table!");

    await update_film_table();
    console.log("synced film table!");

    await update_store_table();
    console.log("synced store table!");

    await update_payment_table();
    console.log("synced payment table!");

    await update_rental_table();
    console.log("synced rental table!");

    await update_bridge_film_actor_table();
    console.log("synced bridge_film_actor table!");

    await update_bridge_film_category_table();
    console.log("synced bridge_film_category table!");

}


// Helper to get current UTC Date
function nowUTC(): Date {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000);
}

export async function add_table_record(tableName: string, manager:any){
    let sync_table_record = await manager.getRepository('sync_table').findOneBy({ table_name: tableName })
    if(!sync_table_record){
        //add an entry
        const sync_table_instance = new sync_table();
        sync_table_instance.table_name = tableName;
        sync_table_instance.last_sync_time = nowUTC();
        sync_table_record = await manager.getRepository('sync_table').save(sync_table_instance);
    }
    return sync_table_record;
}

export async function update_table_record(tableName: string, manager:any){
    let sync_table_record: sync_table = await manager.getRepository('sync_table').findOneBy({ table_name: tableName })
    sync_table_record.last_sync_time = nowUTC();
    sync_table_record = await manager.getRepository('sync_table').save(sync_table_record);
    return sync_table_record;
}