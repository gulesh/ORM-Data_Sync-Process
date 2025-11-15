
import {initCommand} from "./commands/init";
import {full_load_command} from "./commands/full-load";
import {validate} from "./commands/validate";
import {incremental} from "./commands/incremental";

async function run() {
    const init_run = await initCommand();
    if(init_run) {
        console.log("data sources initialized successfully");
    } else
    {
        console.log("data sources could not be initialized.");
    }
    const full_load_run = await full_load_command();
    if(full_load_run) {
        console.log("full load successful.");
    } else
    {
        console.log("full load unsuccessful.");
    }
    const validate_run = await validate();
    if(validate_run) {
        console.log("validate run successful.");
    } else
    {
        console.log("validate run unsuccessful.");
    }

    const incremental_run = await incremental();
    if(incremental_run) {
        console.log("sync run successful.");
    } else
    {
        console.log("sync run unsuccessful.");
    }

}

run().then(() => {
    console.log("run done!");
})



