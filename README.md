# Boba Cross Chain Bridges

This contains: A simple script to deploy the bridges between Ethereum and Alt-L1s and a simple script to bridge tokens between Ethereum and Alt-L1s.

## Bridge BOBA tokens from Ethereum to Alt L1s

* Install packages

```bash
$ yarn install
# or 
$ npm install
```

* Add `.env` in the root directory

  | Environment Variable   | Required |                                                              |
  | ---------------------- | -------- | ------------------------------------------------------------ |
  | ETH_CHAIN_URL          | No       | Ethereum node URL                                            |
  | TARGET_CHAIN_URL       | Yes      | Alt L1 web3 node URL                                         |
  | TARGET_CHAIN_NAME      | Yes      | BNB \|\|Fantom \|\| Avalanche \|\| Moonbeam                  |
  | PRIVATE_KEY            | Yes      | Private key for bridging BOBA from Ethereum to Alt L1        |
  | DEPOSIT_AMOUNT         | Yes      | We automatically attach 18 decimals to your amount (1 means one BOBA) |
  | DEPOSIT_WALLET_ADDRESS | No       | The wallet address for receiving the BOBA on Alt L1          |

* Run script

  ```bash
  $ yarn bridgeFromEthToAltL1
  #or
  $ node scripts/bridgeFromEthereumToAltL1.js
  ```

## Bridge BOBA tokens from Alt L1s to Eth

* Install packages

```bash
$ yarn install
# or 
$ npm install
```

* Add `.env` in the root directory

  | Environment Variable   | Required |                                                              |
  | ---------------------- | -------- | ------------------------------------------------------------ |
  | ETH_CHAIN_URL          | No       | Ethereum node URL                                            |
  | ORIGIN_CHAIN_URL       | Yes      | Alt L1 web3 node URL                                         |
  | ORIGIN_CHAIN_NAME      | Yes      | BNB \|\|Fantom \|\| Avalanche \|\| Moonbeam                  |
  | PRIVATE_KEY            | Yes      | Private key for bridging BOBA from Alt L1 to Eth             |
  | DEPOSIT_AMOUNT         | Yes      | We automatically attach 18 decimals to your amount (1 means one BOBA) |
  | DEPOSIT_WALLET_ADDRESS | No       | The wallet address for receiving the BOBA on Eth             |

* Run script

  ```bash
  $ yarn bridgeFromAltL1ToEth
  #or
  $ node scripts/bridgeFromAltL1ToEthereum.js
  ```

## Tests

### Usage

* Add `.env` in the root directory

  | Environment Variable             | Required |                                                 |
  | -------------------------------- | -------- | ----------------------------------------------- |
  | ETH_CHAIN_URL                    | Yes      | Web3 node URL                                   |
  | TARGET_CHAIN_URL                 | Yes      | Alt-L1 web3 node URL                            |
  | LAYER_ZERO_ETH_ENDPOINT          | Yes      | Layer Zero endpoint for Etherum                 |
  | LAYER_ZERO_TARGET_CHAIN_ENDPOINT | Yes      | Layer Zero endpoint for Alt-L1                  |
  | LAYER_ZERO_ETH_CHAIN_ID          | Yes      | Layer Zero chain ID for Etherum                 |
  | LAYER_ZERO_ALT_L1_CHAIN_ID       | Yes      | Layer Zero chain ID for Alt-L1                  |
  | LAYER_ZERO_CHAIN_NAME            | Yes      | File name for storing contract address          |
  | ETH_DEPLOYER_PRIVATE_KEY         | Yes      | Private key for deploying contracts on Ethereum |
  | ALT_L1_DEPLOYER_PRIVATE_KEY      | Yes      | Private key for deploying contracts on Alt-L1   |
  | ETH_L1_BRIDGE_ADDRESS            | No       | Bridge contract address on Ethereum             |
  | PROXY_ETH_L1_BRIDGE_ADDRESS      | No       | Proxy contract address on Ethereum              |
  | ALT_L1_BRIDGE_ADDRESS            | No       | Bridge contract address on Alt-L1               |
  | PROXY_ALT_L1_BRIDGE_ADDRESS      | No       | Proxy contract address on Alt-L1                |
  | ETH_L1_BOBA_ADDRESS              | Yes      | BOBA contract address on Ethereum               |
  | ALT_L1_BOBA_ADDRESS              | No       | BOBA contract address on Alt-L1                 |

* Deploy bridges and test it

  ```bash
  $ yarn install
  $ yarn deploy
  ```

  Copy and paste the bridge contract addresses to `.env` and run 

  ```javascript
  $ yarn bridge
  ```

  