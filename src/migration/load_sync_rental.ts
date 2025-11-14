
import {getAllRepositoryDataMySql} from "./repository_data";
import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {fact_rental} from "../entity/fact_rental";
import {add_dim_date} from "../add_dim_date"
import {add_table_record} from "../job/sync_job";

export async function sync_rental_table(): Promise<void> {
    const rentals  = await getAllRepositoryDataMySql('rental');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const rental of rentals) {
            if(rental.rental_id)
            {
                await rental_sync_with_sqlite(rental, transactionManager);
            }
        }
        //add an entry to the sync_table
        const sync_row = await add_table_record('rental', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export async  function rental_sync_with_sqlite(row: any, manager: any): Promise<void> {
    console.log(row);
    const fact_rental_instance = new fact_rental();
    fact_rental_instance.rental_id = row['rental_id'];
    fact_rental_instance.staff_id = row['staff_id'];
    let customerDim_Object = await manager.getRepository('dim_customer').findBy({customer_id: row['customer_id']});
    fact_rental_instance.customer_key = customerDim_Object[0]['customer_key'];
    let inventoryObject = await incomingSourceDB.manager.getRepository('inventory').
                                                                                findBy({inventory_id: row['inventory_id']});
    let filmDim_Object = await manager.getRepository('dim_film').findBy({film_id: inventoryObject[0]['film_id']});
    fact_rental_instance.film_key = filmDim_Object[0]['film_key'];
    let staffObject = await incomingSourceDB.manager.getRepository('staff').
                                                                    findBy({staff_id: row['staff_id']});
    let storeDim_Object = await manager.getRepository('dim_store').findBy({store_id: staffObject[0]['store_id']});
    fact_rental_instance.store_key = storeDim_Object[0]['store_key'];
    let rental_date = new Date(row['rental_date']);
    //create dim_date for return and rented
    fact_rental_instance.date_key_rented = null;
    fact_rental_instance.date_key_return = null;
    fact_rental_instance.rental_duration_days = null;
    const dim_date_key_rented = await add_dim_date( rental_date, manager);
    fact_rental_instance.date_key_rented = dim_date_key_rented?.date_key;
    let return_date = row['return_date'] ? new Date(row['return_date']) : null;
    let dim_date_key_returned = null;
    if (return_date) {
        dim_date_key_returned = await add_dim_date( return_date, manager);
        fact_rental_instance.date_key_rented = dim_date_key_returned?.date_key;
        fact_rental_instance.rental_duration_days = dim_date_key_returned.date_key - dim_date_key_rented.date_key;
    }
    await outgoingSourceDB.manager.getRepository('fact_rental').save(fact_rental_instance);

    //add an entry to the sync_table
    const sync_row = await add_table_record('inventory', manager);
    console.log("sync_row", sync_row);
}
