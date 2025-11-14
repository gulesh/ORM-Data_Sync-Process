#!/usr/bin/env node

import * as readline from "readline";
import {initCommand} from "./commands/init";
import {full_load_command} from "./commands/full-load";
import {incremental} from "./commands/incremental";
import {validate} from "./commands/validate";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "orm-cli> "
});

console.log("CLI ready. Type exit to quit.")
rl.prompt();


rl.on("line", (line) => {
    const args = line.trim().split(" ");
    const command = args[0];
    let init_status = false;
    let full_load_status = false;

    switch (command) {
        case "init":
            try {
                if(init_status){
                    initCommand().then((result)=> {
                        init_status = result;
                        console.log(`init successful: ${result}`);
                    });
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
                        full_load_command().then((result)=> {
                            full_load_status = result;
                            console.log(`full load successful: ${result}`);
                        })
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
                if(init_status){
                    console.log("Initializing sync...");
                    incremental().then((result)=> {
                        console.log(`sync successful: ${result}`);
                    })
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
                    validate().then((result)=> {
                        console.log(`validation successful: ${result}`);
                    })
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
