
import {getAllRepositoryDataMySql} from "./repository_data";
import { outgoingSourceDB} from "../data-source";
import {bridge_film_category} from "../entity/bridge_film_category";
import {add_table_record} from "../job/sync_job";

export async function sync_bridge_film_category_table(): Promise<void> {
    const film_category_pairs  = await getAllRepositoryDataMySql('film_category');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const film_category_pair of film_category_pairs) {
            await bridge_film_category_sync_with_sqlite(film_category_pair, transactionManager);
        }

        const sync_row = await add_table_record('film_category', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export async  function bridge_film_category_sync_with_sqlite(row: any, manager: any): Promise<void> {
    const bridge_film_category_instance = new bridge_film_category();
    let film_Dim_Object = await manager.getRepository('dim_film').findBy({film_id: row['film_id']});
    bridge_film_category_instance.film_key = film_Dim_Object[0]['film_key'];
    let category_Dim_Object = await manager.getRepository('dim_category').findBy({category_id: row['category_id']});
    bridge_film_category_instance.category_key = category_Dim_Object[0]['category_key'];
    await outgoingSourceDB.manager.getRepository('bridge_film_category').save(bridge_film_category_instance);
}
