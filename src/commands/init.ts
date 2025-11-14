import {incomingSourceDB, outgoingSourceDB} from "../data-source";

export const initCommand = async (): Promise<boolean> => {
    let result = false;
    initializeDatabases().then(async () => {
        result = true;
    }).catch((e: Error) => {
        console.log('error:', e);
    })

    return result;
}

async function initializeDatabases(){
    console.log("Initializing databases!");
    await incomingSourceDB.initialize();
    await outgoingSourceDB.initialize();
    console.log("Database initialized!")
}