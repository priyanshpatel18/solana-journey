# 🦀 Native Rust Solana Counter Program

This is my first native Rust Solana program. It implements a basic counter smart contract that increments or decrements a stored value in an account.

---

## 📦 Steps I Followed

### 1. Initialize the Project

```bash
cargo new solana-counter --lib
cd solana-counter
```

### Add dependencies

```bash
cargo add solana-program@1.18.26 borsh borsh-derive
```

### Add output formats in the `Cargo.toml` file
```toml
[lib]
crate-type = ["cdylib", "lib"]
```

### Import the dependencies
```rs
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};
```

### Add structs
```rs
#[derive(BorshDeserialize, BorshSerialize)]
enum CounterInstruction {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32,
}
```

### Logic
```rs
entrypoint!(program_counter);

pub fn program_counter(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account = next_account_info(&mut accounts.iter())?;
    let mut counter = Counter::try_from_slice(&account.data.borrow())?;

    match CounterInstruction::try_from_slice(instruction_data)? {
        CounterInstruction::Decrement(amount) => {
            counter.count -= amount;
        }
        CounterInstruction::Increment(amount) => {
            counter.count += amount;
        }
    }

    counter.serialize(&mut *account.data.borrow_mut())?;
    msg!("Counter updated: {}", counter.count);
    msg!("Account: {:?}", account.key);

    Ok(())
}
```

### Build and test
```bash
cargo build
```