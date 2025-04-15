use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
struct Data {
    count: i32,
}

fn main() {
    let original = Data { count: 10 };

    let mut buffer = Vec::new();
    original.serialize(&mut buffer).unwrap();

    let deserialized = Data::try_from_slice(&mut buffer).unwrap();

    assert_eq!(original, deserialized);
    println!(
        "Successfully serialized and deserialized: {:?}",
        deserialized
    );
}
