import {sync_table} from "../entity/sync_table";
import {update_actor_table} from "./sync_actor";
import {update_category_table} from "./sync_category";
import {update_customer_table} from "./sync_customer";
import {update_film_table} from "./sync_film";
import {update_store_table} from "./sync_store";
import {update_payment_table} from "./sync_payment";
import {update_rental_table} from "./sync_rentals";
import {table_validation} from "../table_validation";

const tables = [
    "film",
    "actor",
    "language",
    "category",
    "film_actor",
    "film_category",
    "inventory",
    "rental",
    "payment",
    "store",
    "staff",
    "customer",
    "address",
    "city",
    "country"
];

export async function sync_job(){
    console.log("sync job Starting...");

    await update_actor_table();
    await table_validation('actor', 'dim_actor');
    console.log("synced actor table!");

    await update_category_table();
    await table_validation('category', 'dim_category');
    console.log("synced category table!");

    await update_customer_table();
    await table_validation('customer', 'dim_customer');
    console.log("synced customer table!");

    await update_film_table();
    await table_validation('film', 'dim_film');
    console.log("synced film table!");

    await update_store_table();
    await table_validation('store', 'dim_store');
    console.log("synced store table!");

    await update_payment_table();
    await table_validation('payment', 'fact_payment');
    console.log("synced payment table!");

    await update_rental_table();
    await table_validation('rental', 'fact_rental');
    console.log("synced rental table!");

}

export async function add_table_record(tableName: string, manager:any){
    let sync_table_record = await manager.getRepository('sync_table').findOneBy({ table_name: tableName })
    if(!sync_table_record){
        //add an entry
        const sync_table_instance = new sync_table();
        sync_table_instance.table_name = tableName;
        sync_table_instance.last_sync_time = new Date(Date.now());
        sync_table_record = await manager.getRepository('sync_table').save(sync_table_instance);
    }
    return sync_table_record;
}

export async function update_table_record(tableName: string, manager:any){
    let sync_table_record: sync_table = await manager.getRepository('sync_table').findOneBy({ table_name: tableName })
    sync_table_record.last_sync_time = new Date(Date.now());
    sync_table_record = await manager.getRepository('sync_table').save(sync_table_record);
    return sync_table_record;
}