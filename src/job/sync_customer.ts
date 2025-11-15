import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {dim_customer} from "../entity/dim_customer";
import {compareRecordField} from "../migration/compareRecordField";
import {customer_sync_with_sqlite} from "../migration/load_sync_customer";

export async function update_customer_table(): Promise<void> {

    let sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'customer'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const oneHourBeforeLastSync = new Date(last_sync_date.getTime() - 60 * 60 * 1000);
    const customers = await incomingSourceDB.manager.getRepository('customer').find({
        where: { last_update: MoreThan(oneHourBeforeLastSync) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const customer of customers) {
            await add_update_customer(customer, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('customer', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_customer(row: any, manager: any): Promise<void> {
    const customer_record: dim_customer =  await manager.getRepository('dim_customer').findOneBy({customer_id: row['customer_id']});
    if(customer_record){
        if(!compareRecordField(customer_record.first_name, row['first_name']))
        {
            customer_record.first_name = row['first_name'];
        }
        if(!compareRecordField(customer_record.last_name, row['last_name']))
        {
            customer_record.last_name = row['last_name'];
        }
        if(!compareRecordField(customer_record.active, row['active']))
        {
            customer_record.active = row['active'];
        }
        //need more here
        let addressObject = await incomingSourceDB.manager.getRepository('address').findBy({address_id: row['address_id']});
        let cityObject = await incomingSourceDB.manager.getRepository('city').findBy({city_id: addressObject[0]['city_id']});
        let countryObject = await incomingSourceDB.manager.getRepository('country').findBy({country_id: cityObject[0]['country_id']});
        if(!compareRecordField(customer_record.country, countryObject[0]['country']))
        {
            customer_record.country = countryObject[0]['country'];
        }
        if(!compareRecordField(customer_record.city, cityObject[0]['city']))
        {
            customer_record.city = cityObject[0]['city'];
        }
        if(!compareRecordField(customer_record.last_update, row['last_update']))
        {
            customer_record.last_update = new Date(row['last_update']);
        }
        await manager.getRepository('dim_customer').save(customer_record);
    }
    else
    {
        await customer_sync_with_sqlite(row, manager);
    }
}

