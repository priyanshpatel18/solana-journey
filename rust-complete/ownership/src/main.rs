fn main() {
    let str = String::from("Priyansh");

    // Way 1 - Transferring back the ownership
    let (mut str, len) = get_length(str);
    println!("Length of the {} is {}", str, len);

    // Way 2 - Borowing the ownership
    println!("Length of the {} is {}", str, get_string_length(&str));

    println!("I am {}", str);
    let name = &mut str;
    append_text(name);
    println!("{}", name);
}

fn get_length(str: String) -> (String, usize) {
    let len = str.len();
    return (str, len);
}

fn get_string_length(str: &String) -> usize {
    let len = str.len();
    return len;
}

fn append_text(str: &mut String) {
    str.push_str(" is a good boy");
}
