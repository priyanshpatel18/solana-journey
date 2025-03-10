/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting.json`.
 */
export type Voting = {
  "address": "CCqSC4D4fJDj9KeKgibvyW2xd1FYuSEi8i7hjHovgDkK",
  "metadata": {
    "name": "voting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addCandidate",
      "discriminator": [
        172,
        34,
        30,
        247,
        165,
        210,
        224,
        164
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pollAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "arg",
                "path": "candidateId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "candidateId",
          "type": "u64"
        },
        {
          "name": "candidateName",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteCandidate",
      "discriminator": [
        96,
        231,
        51,
        155,
        5,
        20,
        214,
        17
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pollAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidateAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "arg",
                "path": "candidateId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "candidateId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deletePoll",
      "discriminator": [
        156,
        80,
        237,
        248,
        65,
        44,
        143,
        152
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pollAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePoll",
      "discriminator": [
        193,
        22,
        99,
        197,
        18,
        33,
        115,
        117
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "pollStart",
          "type": "u64"
        },
        {
          "name": "pollEnd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "arg",
                "path": "candidateId"
              }
            ]
          }
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "candidateId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "candidate",
      "discriminator": [
        86,
        69,
        250,
        96,
        193,
        10,
        222,
        123
      ]
    },
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPollTime",
      "msg": "Poll start time must be before the end time."
    },
    {
      "code": 6001,
      "name": "invalidPollEnd",
      "msg": "Poll end time cannot be in the past."
    },
    {
      "code": 6002,
      "name": "alreadyVoted",
      "msg": "You have already voted in this poll."
    },
    {
      "code": 6003,
      "name": "votingClosed",
      "msg": "Voting for this poll is closed."
    },
    {
      "code": 6004,
      "name": "invalidCandidate",
      "msg": "Selected candidate does not belong to this poll."
    },
    {
      "code": 6005,
      "name": "invalidPoll",
      "msg": "Invalid poll reference."
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "Only the poll creator can modify this poll"
    },
    {
      "code": 6007,
      "name": "candidatesExist",
      "msg": "Candidates still exist for this poll. Remove them before deleting the poll."
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "candidateId",
            "type": "u64"
          },
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "pollStart",
            "type": "u64"
          },
          {
            "name": "pollEnd",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "totalCandidates",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hasVoted",
            "type": "bool"
          },
          {
            "name": "candidateId",
            "type": "u64"
          },
          {
            "name": "pollId",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
