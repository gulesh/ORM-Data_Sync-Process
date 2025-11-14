import { incomingSourceDB, outgoingSourceDB } from "./data-source"
import {initial_full_load} from "./migration/initial_full_load";
import {sync_job} from "./job/sync_job";
import {validation_job} from "./job/validation_job";


async function initializeDatabases() {
    console.log("Initializing databases!");
    await incomingSourceDB.initialize();
    await outgoingSourceDB.initialize();
    console.log("Database initialized!")
}

initializeDatabases().then(r =>
{
    initial_full_load().then( () => {console.log('initial load successful...!!!')});
    sync_job().then(()=> {
        console.log("sync run!")
    });
    validation_job().then(()=> {console.log('validation job...!!!')});
}).catch(error => console.log(error));



