#[derive(Debug)]
struct User<'a> {
    name: &'a str,
}

impl<'a> User<'a> {
    fn new(name: &'a str) -> User<'a> {
        User { name }
    }
}

fn main() {
    let name = String::from("John");
    let user = User { name: &name };

    let new_user = User::new(&name);

    println!("{:?}", user);
    println!("{:?}", new_user);
}
