# CLASSICAL VOTING PROGRAM

## Introduction

The **Solana Voting Program** is as smart contract written in Rust using Anchor framework for the solana blockchain. It allows users to create polls, add candidates, and vote for their preferred options.

## Features

Initialize Polls: Create a new voting poll with a start and end date.

Add Candidates: Register candidates for a poll.

Vote: Users can cast their votes for a candidate in a poll.

Prevent Duplicate Votes: Each user can only vote once per poll.

Delete Candidates: Remove a candidate from a poll.

Delete Polls: Remove an entire poll from the system.

## Prerequisites

Before running the program, ensure you have the following:

Node.js (latest LTS version recommended)

Rust (with solana toolchain installed)

Solana CLI installed

Anchor framework installed

## Project Setup

### Clone the repository and navigate into the project directory:

```bash
git clone --no-checkout https://github.com/priyanshpatel18/solana-journey.git
cd solana-journey
git sparse-checkout init --cone
git sparse-checkout set practice-voting
git checkout main
```

### Install Dependencies:

```bash
npm install
```

### Start Solana Localnet:

```bash
solana-test-validator
```

### Build the Program:

```bash
cd anchor
anchor build
```

### Test the Program:

```bash
anchor test --skip-local-validator --skip-deploy
```

## Key Functions

`initializePoll`
```js
await votingProgram.methods.inititalizePoll(
  pollId,
  "Who is the best blockchain?",
  pollStart,
  pollEnd
).rpc();
```
Creates a new poll with a question and start/end timestamps.

`addCandidate`
```js
await votingProgram.methods.addCandidate(
  pollId,
  "Solana"
).rpc();
```
Adds a candidate to a poll.

`vote`
```js
await votingProgram.methods.vote(
  pollId,
  candidateId
).rpc();
```
Casts a vote for a candidate in a poll.

`deleteCandidate`

```js
await votingProgram.methods.deleteCandidate(
  pollId,
  candidateId
).rpc();
```
Removes a candidate from a poll.

`deletePoll`

```js
await votingProgram.methods.deletePoll(
  pollId
).rpc();
```

Removes an entire poll from the system.

## Deployment to Devnet

To deploy the program to devnet, run the following command:

```bash
solana config set --ud
# Check config - Ensure devnet
solana config get
solana airdrop 2
anchor build
anchor deploy
```

## License

This project is licensed under the [MIT License](LICENSE).
