import {sync_table} from "../entity/sync_table";
import {update_actor_table} from "./sync_actor";
import {update_category_table} from "./sync_category";
import {update_customer_table} from "./sync_customer";

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

    //await update_actor_table();
    //console.log("synced actor table!");

    //await update_category_table();
    //console.log("synced category table!");

    await update_customer_table();
    console.log("synced customer table!");


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