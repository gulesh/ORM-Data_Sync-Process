import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {compareRecordField} from "../migration/compareRecordField";
import {dim_store} from "../entity/dim_store";
import {store_sync_with_sqlite} from "../migration/load_sync_store";

export async function update_store_table(): Promise<void> {

    let sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'store'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const stores = await incomingSourceDB.manager.getRepository('store').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const store of stores) {
            await add_update_store(store, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('store', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_store(row: any, manager: any): Promise<void> {
    const store_record: dim_store =  await manager.getRepository('dim_store').findOneBy({store_id: row['store_id']});
    if(store_record){
        let addressObject = await incomingSourceDB.manager.getRepository('address').findBy({address_id: row['address_id']});
        let cityObject = await incomingSourceDB.manager.getRepository('city').findBy({city_id: addressObject[0]['city_id']});
        let countryObject = await incomingSourceDB.manager.getRepository('country').findBy({country_id: cityObject[0]['country_id']});
        if(!compareRecordField(store_record.country, countryObject[0]['country']))
        {
            store_record.country = countryObject[0]['country'];
        }
        if(!compareRecordField(store_record.city, cityObject[0]['city']))
        {
            store_record.city = cityObject[0]['city'];
        }
        if(!compareRecordField(store_record.last_update, row['last_update']))
        {
            store_record.last_update = new Date(row['last_update']);
        }
        await manager.getRepository('dim_store').save(store_record);
    }
    else
    {
        await store_sync_with_sqlite(row, manager);
    }
}

