import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {compareRecordField} from "../migration/compareRecordField";
import {add_dim_date} from "../add_dim_date";
import {rental_sync_with_sqlite} from "../migration/load_sync_rental";
import {fact_rental} from "../entity/fact_rental";

export async function update_rental_table(): Promise<void> {

    let sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'rental'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const payments = await incomingSourceDB.manager.getRepository('rental').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const payment of payments) {
            await add_update_rental(payment, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('rental', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_rental(row: any, manager: any): Promise<void> {
    const rental_record: fact_rental =  await manager.getRepository('fact_rental').findOneBy({rental_id: row['rental_id']});
    if(rental_record){
        if(!compareRecordField(rental_record.staff_id, row['staff_id']))
        {
            rental_record.staff_id = row['staff_id'];
        }
        let customerDim_Object = await manager.getRepository('dim_customer').findBy({customer_id: row['customer_id']});
        let inventoryObject = await incomingSourceDB.manager.getRepository('inventory').findBy({inventory_id: row['inventory_id']});
        let filmDim_Object = await manager.getRepository('dim_film').findBy({film_id: inventoryObject[0]['film_id']});
        let staffObject = await incomingSourceDB.manager.getRepository('staff').findBy({staff_id: row['staff_id']});
        let storeDim_Object = await manager.getRepository('dim_store').findBy({store_id: staffObject[0]['store_id']});
        if(!compareRecordField(rental_record.customer_key, customerDim_Object[0]['customer_key']))
        {
            rental_record.customer_key = customerDim_Object[0]['customer_key'];
        }
        if(!compareRecordField(rental_record.store_key, storeDim_Object[0]['store_key']))
        {
            rental_record.store_key = storeDim_Object[0]['store_key'];
        }
        if(!compareRecordField(rental_record.film_key, filmDim_Object[0]['film_key']))
        {
            rental_record.film_key =filmDim_Object[0]['film_key'];
        }
        let dim_date_key_rented= await add_dim_date(new Date(row['payment_date']), manager);
        if(!compareRecordField(rental_record.date_key_rented, dim_date_key_rented?.date_key))
        {
            rental_record.date_key_rented = dim_date_key_rented?.date_key;
        }

        let dim_date_key_returned = await add_dim_date(new Date(row['payment_date']), manager);
        if(!compareRecordField(rental_record.date_key_return, dim_date_key_returned?.date_key))
        {
            rental_record.date_key_rented = dim_date_key_returned?.date_key;
        }
        await manager.getRepository('fact_rental').save(rental_record);
    }
    else
    {
        await rental_sync_with_sqlite(row, manager);
    }
}

