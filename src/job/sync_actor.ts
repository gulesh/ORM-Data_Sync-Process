import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {dim_actor} from "../entity/dim_actor";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {actor_sync_with_sqlite} from "../migration/load_sync_actor";
import {compareRecordField} from "../migration/compareRecordField";

export async function update_actor_table(): Promise<void> {

    const sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'actor'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_time : new Date(0);
    const actors = await incomingSourceDB.manager.getRepository('actor').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const actor of actors) {
            await add_update_actor(actor, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('actor', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_actor(row: any, manager: any): Promise<void> {
    const actor_record: dim_actor =  await manager.getRepository('dim_actor').findOneBy({actor_id: row['actor_id']});
    if(actor_record){
        if(!compareRecordField(actor_record.first_name, row['first_name']))
        {
            actor_record.first_name = row['first_name'];
        }
        if(!compareRecordField(actor_record.last_name, row['last_name']))
        {
            actor_record.last_name = row['last_name'];
        }
        if(!compareRecordField(actor_record.last_update, row['last_update']))
        {
            actor_record.last_update = new Date(row['last_update']);
        }
        await manager.getRepository('dim_actor').save(actor_record);
    }
    else
    {
        await actor_sync_with_sqlite(row, manager);
    }
}
