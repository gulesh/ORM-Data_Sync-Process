import {initial_full_load} from "../migration/initial_full_load";

export const full_load_command = async (): Promise<boolean> => {
    let result = false;
    initial_full_load().then(async () => {
        result = true;
    }).catch((e: Error) => {
        console.log('error:', e);
    })

    return result;
}
