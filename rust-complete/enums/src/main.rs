use std::f32::consts::PI;
use std::fs;

#[derive(Debug)]
enum Shape {
    Circle(f32),
    Square(f32),
    Rectangle(f32, f32),
}

fn main() {
    let circle = Shape::Circle(5.0);
    let square = Shape::Square(6.0);
    let rect = Shape::Rectangle(5.0, 4.0);

    println!("Area of Circle: {} sq units", calculate_area(circle));
    println!("Area of Square: {} sq units", calculate_area(square));
    println!("Area of Rectangle: {} sq units", calculate_area(rect));

    // Result Enum
    let my_file = fs::read_to_string("my_file.txt");

    match my_file {
        Ok(content) => println!("File content: {}", content),
        Err(err) => println!("Error reading file: {}", err),
    }

    // Option Enum
    let name = String::from("Priyansh");
    let result = find_first_a(&name);
    match result {
        Some(index) => println!("First 'a' found at index: {}", index),
        None => println!("No 'a' found in the string."),
    }
}

fn calculate_area(shape: Shape) -> f32 {
    match shape {
        Shape::Circle(radius) => PI * radius * radius,
        Shape::Square(side) => side * side,
        Shape::Rectangle(width, height) => width * height,
    }
}

fn find_first_a(str: &String) -> Option<i32> {
    for (index, char) in str.chars().enumerate() {
        if char == 'a' {
            return Some(index as i32);
        }
    }
    return None;
}
