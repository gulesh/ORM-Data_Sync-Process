import {table_validation} from "../table_validation";

export async function validation_job(){
    console.log("validation job Starting...");
    await table_validation('actor', 'dim_actor');
    await table_validation('category', 'dim_category');
    await table_validation('customer', 'dim_customer');
    await table_validation('film', 'dim_film');
    await table_validation('store', 'dim_store');
    await table_validation('payment', 'fact_payment');
    await table_validation('rental', 'fact_rental');
    console.log("validation job finished!");
}