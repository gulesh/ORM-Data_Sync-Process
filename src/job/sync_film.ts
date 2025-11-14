import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {update_table_record} from "./sync_job";
import {MoreThan} from "typeorm";
import {compareRecordField} from "../migration/compareRecordField";
import {dim_film} from "../entity/dim_film";
import {film_sync_with_sqlite} from "../migration/load_sync_film";

export async function update_film_table(): Promise<void> {

    let sync_table_record = await outgoingSourceDB.manager.getRepository('sync_table').findOneBy({table_name: 'film'});
    const last_sync_date = sync_table_record ? sync_table_record.last_sync_date : new Date(0);
    const films = await incomingSourceDB.manager.getRepository('film').find({
        where: { last_update: MoreThan(last_sync_date) }
    });

    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const film of films) {
            await add_update_film(film, transactionManager);
        }
        //update the entry in sync table
        const sync_row_updated = await update_table_record('film', transactionManager);
        console.log("sync_row", sync_row_updated);
    })
}

export async  function add_update_film(row: any, manager: any): Promise<void> {
    const film_record: dim_film =  await manager.getRepository('dim_film').findOneBy({film_id: row['film_id']});
    if(film_record){
        if(!compareRecordField(film_record.title, row['title']))
        {
            film_record.title = row['title'];
        }
        if(!compareRecordField(film_record.rating, row['rating']))
        {
            film_record.rating = row['rating'];
        }
        let language_record = await incomingSourceDB.manager.getRepository('language').findBy({language_id: row['language_id']});
        if(!compareRecordField(film_record.language, language_record[0]['name']))
        {
            film_record.language = language_record[0]['name'];
        }

        if(!compareRecordField(film_record.release_year, row['release_year']))
        {
            film_record.release_year = row['release_year'];
        }
        if(!compareRecordField(film_record.length, row['length']))
        {
            film_record.length = row['length'];
        }
        if(!compareRecordField(film_record.last_update, row['last_update']))
        {
            film_record.last_update = new Date(row['last_update']);
        }
        await manager.getRepository('dim_film').save(film_record);
    }
    else
    {
        await film_sync_with_sqlite(row, manager);
    }
}

