#[derive(Clone)]
struct User {
    name: String,
    age: i8,
    email: String,
}

struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rect) -> bool {
        self.width > other.width && self.height > other.height
    }

    fn print_str() {
        println!("Hello from Rect");
    }
}

fn main() {
    let me = User {
        name: String::from("Priyansh"),
        age: 20,
        email: String::from("priyanshpatel18@gmail.com"),
    };

    print_user(me.clone());

    let rect1 = Rect {
        width: 10,
        height: 20,
    };

    println!("Area: {} sq units", rect1.area());

    let rect2 = Rect {
        width: 5,
        height: 10,
    };
    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));

    Rect::print_str();
}

fn print_user(user: User) {
    println!("Name: {}", user.name);
    println!("Age: {}", user.age);
    println!("Email: {}", user.email);
}
