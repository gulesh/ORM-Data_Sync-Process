import {incomingSourceDB, outgoingSourceDB} from "./data-source";
import {sync_log} from "./entity/sync_log";

export async function table_validation(table_source: string, table_target:string): Promise<void> {
        const records_source = await incomingSourceDB.manager.getRepository(table_source).find({})
        const records_target = await outgoingSourceDB.manager.getRepository(table_target).find({})

        const sync_log_instance = new sync_log();
        sync_log_instance.sync_date = new Date(Date.now());
        sync_log_instance.source_table_name = table_source;
        sync_log_instance.target_table_name = table_target;

        const sourceCount = records_source?.length ?? 0;
        const targetCount = records_target?.length ?? 0;
        const difference = Math.abs(sourceCount - targetCount);
        sync_log_instance.source_records_count = sourceCount;
        sync_log_instance.target_records_count = targetCount;
        sync_log_instance.records_difference = difference;
        let sync_status_local = "success";

        if (sourceCount === 0 && targetCount > 0) {
            sync_status_local = "failed";
        } else if (sourceCount > 0) {
            const discrepancy = (difference * 100) / sourceCount;
            if (discrepancy > 0 && discrepancy < 5) {
                sync_status_local = "warning";
                console.warn(`${discrepancy} records are missing!`);
            }
            else if (discrepancy >= 5)
            {
                sync_status_local = "failed";
                console.error(`${discrepancy} records are missing! Raising critical error!`);
            }
        }
        sync_log_instance.sync_status = sync_status_local;

        console.log("sync status (", table_source, ":", sourceCount, ",", table_target, ":", targetCount, "): ", sync_status_local );

        await outgoingSourceDB.manager.getRepository('sync_log').save(sync_log_instance);

}