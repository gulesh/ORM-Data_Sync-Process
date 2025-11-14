import {validation_job} from "../job/validation_job";

export  const validate = async () : Promise<boolean> => {
    let result = false;
    validation_job().then(async () => {
        result = true;
    }).catch((e: Error) => {
        console.log('error:', e);
    })

    return result;
}