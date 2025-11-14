
import {getAllRepositoryDataMySql, getOneRecordForMySqlRepo} from "./repository_data";
import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {dim_store} from "../entity/dim_store";
import {add_table_record} from "../job/sync_job";

export async function sync_store_table(): Promise<void> {
    const stores  = await getAllRepositoryDataMySql('store');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const store of stores) {
            await store_sync_with_sqlite(store, transactionManager);
        }

        //add an entry to the sync_table
        const sync_row = await add_table_record('store', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export async  function store_sync_with_sqlite(row: any, manager: any): Promise<void> {

    let address_id = row['address_id'];
    let addressObject = await incomingSourceDB.manager.getRepository('address').findBy({address_id: address_id});

    let city_id = addressObject[0]['city_id'];
    let cityObject = await incomingSourceDB.manager.getRepository('city').findBy({city_id: city_id});
    let city = cityObject[0]['city'];

    let country_id = cityObject[0]['country_id'];
    let countryObject = await incomingSourceDB.manager.getRepository('country').findBy({country_id: country_id});
    let country = countryObject[0]['country'];

    const dim_store_instance = new dim_store();
    dim_store_instance.store_id = row['store_id'];
    dim_store_instance.city = city;
    dim_store_instance.country = country;
    dim_store_instance.last_update = new Date(row['last_update']);
    await manager.getRepository('dim_store').save(dim_store_instance);

    const sync_row_address = await add_table_record('address', manager);
    console.log("sync_row", sync_row_address);
    const sync_row_city = await add_table_record('city', manager);
    console.log("sync_row", sync_row_city);
    const sync_row_country = await add_table_record('country', manager);
    console.log("sync_row", sync_row_country);

}