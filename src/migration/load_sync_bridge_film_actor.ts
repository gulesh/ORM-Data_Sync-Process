
import {getAllRepositoryDataMySql} from "./repository_data";
import { outgoingSourceDB} from "../data-source";
import {bridge_film_actor} from "../entity/bridge_film_actor";
import {add_table_record} from "../job/sync_job";

export async function sync_bridge_film_actor_table(): Promise<void> {
    const film_actor_pairs  = await getAllRepositoryDataMySql('film_actor');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const film_actor_pair of film_actor_pairs) {
            await bridge_film_actor_sync_with_sqlite(film_actor_pair, transactionManager);
        }
        //add an entry to the sync_table
        const sync_row = await add_table_record('film_actor', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export async  function bridge_film_actor_sync_with_sqlite(row: any, manager: any): Promise<void> {

    const bridge_film_actor_instance = new bridge_film_actor();
    let film_Dim_Object = await manager.getRepository('dim_film').findBy({film_id: row['film_id']});
    bridge_film_actor_instance.film_key = film_Dim_Object[0]['film_key'];
    let actor_Dim_Object = await manager.getRepository('dim_actor').findBy({actor_id: row['actor_id']});
    bridge_film_actor_instance.actor_key = actor_Dim_Object[0]['actor_key'];
    await outgoingSourceDB.manager.getRepository('bridge_film_actor').save(bridge_film_actor_instance);
}
