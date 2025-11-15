import {incomingSourceDB, outgoingSourceDB} from "../data-source";

export const initCommand = async (): Promise<boolean> => {
    try {
        console.log("Initializing databases!");
        await initializeDatabases(); // Wait for completion
        return true; // Success
    } catch (e) {
        console.error('Error initializing databases:', e);
        return false; // Failure
    }
}

async function initializeDatabases(){
    console.log("Initializing MySQL database!");
    await incomingSourceDB.initialize();
    console.log("MySql initialized!")
    console.log("Initializing Sqlite database!");
    await outgoingSourceDB.initialize();
    console.log("Sqlite initialized!")
}