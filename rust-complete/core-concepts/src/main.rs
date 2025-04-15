fn main() {
    let x = 10;
    println!("{}", x);

    let is_male = true;

    if is_male {
        println!("You are MALE");
    } else {
        println!("You are FEMALE");
    }

    let name = String::from("Priyansh");
    println!("{}", name);

    let arr = [1, 2, 3, 4, 5];
    println!("{:?}", arr);

    let mut xs = vec![1, 2, 3];
    xs.push(4);
    println!("{:?}", xs);

    // Panic
    panic_code(100);
}

fn panic_code(mut x: i8) {
    for _ in 0..100 {
        x += 127
    }

    println!("{}", x);
}
