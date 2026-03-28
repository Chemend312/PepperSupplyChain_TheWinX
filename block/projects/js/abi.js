const ABI =  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "actor",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum PepperSupplyChain.Action",
          "name": "action",
          "type": "uint8"
        }
      ],
      "name": "AuditLog",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "farmId",
          "type": "bytes32"
        }
      ],
      "name": "FarmCertified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        }
      ],
      "name": "LotCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        }
      ],
      "name": "LotFlagged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newLot",
          "type": "uint256"
        }
      ],
      "name": "LotMerged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        }
      ],
      "name": "LotRecalled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "role",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lotId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum PepperSupplyChain.Status",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "StatusChanged",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "buyLot",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "certifiers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "farmId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "certHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "validUntil",
          "type": "uint256"
        }
      ],
      "name": "certifyFarm",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "confirmReceived",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "farmId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        }
      ],
      "name": "createLot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "distributors",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "farmers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "farms",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "certHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "validUntil",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "certified",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "flagLot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getLot",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "farmId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint128",
              "name": "initialWeight",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "processedWeight",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "price",
              "type": "uint128"
            },
            {
              "internalType": "uint64",
              "name": "createdAt",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "updatedAt",
              "type": "uint64"
            },
            {
              "internalType": "enum PepperSupplyChain.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "flagged",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sourceLots",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct PepperSupplyChain.Lot",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "grantCertifier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "grantDistributor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "grantFarmer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "grantProcessor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "grantRetailer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lots",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "farmId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint128",
          "name": "initialWeight",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "processedWeight",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "price",
          "type": "uint128"
        },
        {
          "internalType": "uint64",
          "name": "createdAt",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "updatedAt",
          "type": "uint64"
        },
        {
          "internalType": "enum PepperSupplyChain.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "flagged",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "markShipped",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "markSold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newId",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "source",
          "type": "uint256[]"
        }
      ],
      "name": "mergeLots",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "processedWeight",
          "type": "uint256"
        }
      ],
      "name": "processLot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "processors",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "recallLot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "retailers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "revokeDistributor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "revokeFarmer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "revokeProcessor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "a",
          "type": "address"
        }
      ],
      "name": "revokeRetailer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "setPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "farmId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "newHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "newValid",
          "type": "uint256"
        }
      ],
      "name": "updateFarmCertification",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

window.ABI = ABI;