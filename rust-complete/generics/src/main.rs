use std::fmt::Display;
use std::ops::{Add, Mul};

// Generics over structs
struct Rect<T> {
    width: T,
    height: T,
}

impl<T: Mul<Output = T> + Copy> Rect<T> {
    fn area(&self) -> T {
        self.width * self.height
    }
}

fn main() {
    println!("{}", add(1, 2));
    println!("{}", add(1.1, 2.2));

    print_variable(String::from("PATEL"));
    print_variable(1);

    let r = Rect {
        width: 10,
        height: 20,
    };
    println!("{}", r.area());

    let r2 = Rect {
        width: 10.to_string(),
        height: 20.0.to_string(),
    };
}

// Generics over functions
fn add<T: Add<Output = T>>(a: T, b: T) -> T {
    a + b
}
fn print_variable<T: Display>(a: T) {
    println!("{}", a);
}
