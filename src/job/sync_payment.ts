import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {compareRecordField} from "../migration/compareRecordField";
import {fact_payment} from "../entity/fact_payment";
import {payment_sync_with_sqlite} from "../migration/load_sync_payment";
import {add_dim_date} from "../add_dim_date";

export async function update_payment_table(): Promise<void> {

    let sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'payment'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const payments = await incomingSourceDB.manager.getRepository('payment').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const payment of payments) {
            await add_update_payment(payment, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('payment', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_payment(row: any, manager: any): Promise<void> {
    const payment_record: fact_payment =  await manager.getRepository('fact_payment').findOneBy({payment_id: row.payment_id});
    if(payment_record){
        if(!compareRecordField(payment_record.staff_id, row['staff_id']))
        {
            payment_record.staff_id = row['staff_id'];
        }
        let customerDim_Object = await manager.getRepository('dim_customer').findBy({customer_id: row['customer_id']});
        let staffObject = await incomingSourceDB.manager.getRepository('staff').findBy({staff_id: row['staff_id']});
        let storeDim_Object = await manager.getRepository('dim_store').findBy({store_id: staffObject[0]['store_id']});
        if(!compareRecordField(payment_record.customer_key, customerDim_Object[0]['customer_key']))
        {
            payment_record.customer_key = customerDim_Object[0]['customer_key'];
        }
        if(!compareRecordField(payment_record.store_key, storeDim_Object[0]['store_key']))
        {
            payment_record.store_key = storeDim_Object[0]['store_key'];
        }
        if(!compareRecordField(payment_record.amount, row['amount']))
        {
            payment_record.amount = row['amount'];
        }
        let dim_date_key= await add_dim_date(new Date(row['payment_date']), manager);
        if(!compareRecordField(payment_record.date_key_paid, dim_date_key?.date_key))
        {
            payment_record.date_key_paid = dim_date_key?.date_key;
        }
        await manager.getRepository('fact_payment').save(payment_record);
    }
    else
    {
        await payment_sync_with_sqlite(row, manager);
    }
}

