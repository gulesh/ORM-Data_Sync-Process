import {sync_table} from "../entity/sync_table";
import {outgoingSourceDB} from "../data-source";

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

    //for each table get the last sync date
    for(const table in tables){
        //const sync_table_record = await table_record_in_sync(table);
        //get the last_sync date from sqlite table
        //get all the record which were updated later than the date
        // find the corresponding table in sqlite and update the record
    }
    //check if the sync date is same as that in sync_table if not add the sync_date

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