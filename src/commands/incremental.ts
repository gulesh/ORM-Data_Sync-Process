
import {sync_job} from "../job/sync_job";

export  const incremental = async () : Promise<boolean> => {
    let result = false;
    sync_job().then(async () => {
        console.log("sync successful!")
        result = true;
    }).catch((e: Error) => {
        console.log('error:', e);
    })

    return result;
}