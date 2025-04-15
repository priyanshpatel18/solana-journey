use serde::{Deserialize, Serialize};
macro_rules! say_hello {
    () => {
        println!("Hello!");
    };
}

#[derive(Clone, Debug)]
struct Person {
    name: String,
    age: u32,
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    username: String,
    email: String,
}

fn main() {
    say_hello!();

    let u = User {
        username: String::from("test"),
        email: String::from("test@test.com"),
    };

    let result = serde_json::to_string(&u);
    let json = result.unwrap();
    println!("{}", json);

    let user: User = serde_json::from_str(&json).unwrap();
    println!("{:?}", user);

    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };

    let mut person2 = person1.clone();
    println!("Person 1: {:?}", person1);
    person2.name = String::from("Bob");
    person2.age = 25;
    println!("Person 2: {:?}", person2);
}
