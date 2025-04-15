use ::dotenv::dotenv;
use ::uuid::Uuid;
use std::env;

fn main() {
    dotenv().ok();
    let api_key = env::var("API_KEY").expect("API_KEY must be set");
    println!("{}", api_key);

    let random_uuid = Uuid::new_v4();
    println!("{}", random_uuid);
}
