import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {bridge_film_actor_sync_with_sqlite} from "../migration/load_sync_bridge_film_actor";
import {bridge_film_category_sync_with_sqlite} from "../migration/load_sync_bridge_film_category";

export async function update_bridge_film_category_table(): Promise<void> {

    const sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'film_category'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const film_categories_entries = await incomingSourceDB.manager.getRepository('film_category').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const film_category_entry of film_categories_entries) {
            await add_update_bridge_film_category(film_category_entry, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('film_category', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_bridge_film_category(row: any, manager: any): Promise<void> {
    const bridge_film_actor_record = await manager.getRepository('bridge_film_category').findOneBy({
        film_key: row.film_id,
        category_key: row.category_id
    });
    if(!bridge_film_actor_record){
        await bridge_film_category_sync_with_sqlite(row, manager);
    }
}
