import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {dim_category} from "../entity/dim_category";
import {category_sync_with_sqlite} from "../migration/load_sync_category";
import {compareRecordField} from "../migration/compareRecordField";

export async function update_category_table(): Promise<void> {

    const sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'category'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_date : new Date(0);
    const categories = await incomingSourceDB.manager.getRepository('category').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const category of categories) {
            await add_update_category(category, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('category', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_category(row: any, manager: any): Promise<void> {
    const category_record: dim_category =  await manager.getRepository('dim_category').findOneBy({category_id: row['category_id']});
    if(category_record){
        if(!compareRecordField(category_record.name, row['name']))
        {
            category_record.name = row['name'];
        }
        if(!compareRecordField(category_record.last_update, row['last_update']))
        {
            category_record.last_update = new Date(row['last_update']);
        }
        await manager.getRepository('dim_category').save(category_record);
    }
    else
    {
        await category_sync_with_sqlite(row, manager);
    }
}
