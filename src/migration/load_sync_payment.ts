
import {getAllRepositoryDataMySql} from "./repository_data";
import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {add_dim_date} from "../add_dim_date"
import {fact_payment} from "../entity/fact_payment";
import {add_table_record} from "../job/sync_job";

export async function sync_payment_table(): Promise<void> {
    const payments  = await getAllRepositoryDataMySql('payment');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const payment of payments) {
            await payment_sync_with_sqlite(payment, transactionManager);
        }

        //add an entry to the sync_table
        const sync_row = await add_table_record('payment', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export async  function payment_sync_with_sqlite(row: any, manager: any): Promise<void> {
    const payment_record: fact_payment =  await manager.getRepository('fact_payment').findOneBy({payment_id: row.payment_id});
    if (!payment_record) {
        const fact_payment_instance = new fact_payment();
        fact_payment_instance.payment_id = row.payment_id;
        fact_payment_instance.staff_id = row['staff_id'];
        let customerDim_Object = await manager.getRepository('dim_customer').findBy({customer_id: row['customer_id']});
        fact_payment_instance.customer_key = customerDim_Object[0]['customer_key'];
        let staffObject = await incomingSourceDB.manager.getRepository('staff').
        findBy({staff_id: row['staff_id']});
        let storeDim_Object = await manager.getRepository('dim_store').findBy({store_id: staffObject[0]['store_id']});
        fact_payment_instance.store_key = storeDim_Object[0]['store_key'];
        fact_payment_instance.amount = row['amount'];

        let dim_date_key= await add_dim_date(new Date(row['payment_date']), manager);

        fact_payment_instance.date_key_paid = dim_date_key?.date_key;
        await outgoingSourceDB.manager.getRepository('fact_payment').save(fact_payment_instance);
    }


}