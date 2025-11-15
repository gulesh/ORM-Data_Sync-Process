
import {getAllRepositoryDataMySql} from "./repository_data";
import {dim_film} from "../entity/dim_film";
import {incomingSourceDB, outgoingSourceDB} from "../data-source";
import {add_table_record} from "../job/sync_job";

export async function sync_film_table(): Promise<void> {
    const films  = await getAllRepositoryDataMySql('film');
    await outgoingSourceDB.manager.transaction( async (transactionManager) => {
        for (const film of films) {
            await film_sync_with_sqlite(film, transactionManager);
        }

        //add an entry to the sync_table
        const sync_row = await add_table_record('film', transactionManager);
        console.log("sync_row", sync_row);
    })
}

export  async function film_sync_with_sqlite(row: any, manager: any): Promise<void> {
    let language_record = await incomingSourceDB.manager.getRepository('language').findBy({language_id: row['language_id']});
    const film_record: dim_film =  await manager.getRepository('dim_film').findOneBy({film_id: row['film_id']});
    if (!film_record) {
        const dim_film_instance = new dim_film();
        dim_film_instance.film_id = row['film_id'];
        dim_film_instance.title = row['title'];
        dim_film_instance.rating = row['rating'];
        dim_film_instance.language = language_record[0]['name'];
        dim_film_instance.release_year = row['release_year'];
        dim_film_instance.length = row['length'];
        dim_film_instance.last_update = new Date(row['last_update']);

        await manager.getRepository('dim_film').save(dim_film_instance);
    }

}