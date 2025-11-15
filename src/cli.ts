#!/usr/bin/env node

import * as readline from "readline";
import {initCommand} from "./commands/init";
import {full_load_command} from "./commands/full-load";
import {incremental} from "./commands/incremental";
import {validate} from "./commands/validate";

let init_status = false;
let full_load_status = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "orm-cli> "
});

console.log("Welcome to ORM-CLI...!!!. Type a command- init, full-load, validate, incremental or exit.")
rl.prompt();


rl.on("line", async (line) => {
    const args = line.trim().split(" ");
    const command = args[0];

    switch (command) {
        case "init":
            try {
                if(!init_status){
                    init_status = await initCommand();
                    console.log(`init successful: ${init_status}`);
                } else
                {
                    console.log(`database already initialized`);
                }
            } catch (err) {
                console.error("Init failed:", err);
            }
            break;
        case "full-load":
            try{
                if(init_status){
                    if(!full_load_status)
                    {
                        console.log("Initializing full load...");
                       full_load_status =  await full_load_command();
                       console.log(`full load successful: ${full_load_status}`);

                    }
                } else
                {
                    console.log("run command \'init\' first!");
                }
            } catch (e){
                console.error("full load failed:", e);
            }
            break;
        case "incremental":
            try{
                if(init_status && full_load_status){
                    console.log("Initializing sync...");
                    const status = await incremental();
                    console.log(`sync successful: ${status}`);
                } else
                {
                    console.log("run command \'init\' first!");
                }
            } catch (e){
                console.error("full load failed:", e);
            }
            break;
        case "validate":
            try{
                if(init_status){
                    console.log("validating data...");
                    const status = await validate();
                    console.log(`validation successful: ${status}`);
                } else
                {
                    console.log("run command \'init\' first!");
                }
            } catch (e){
                console.error("validation failed:", e);
            }
            break;
        case "exit":
            rl.close();
            return;
        default:
            console.error(`Command '${command}' not found!`);
    }
    rl.prompt();
})

rl.on("close", () => {
    console.log("Exiting CLI.");
    process.exit(0);
});
