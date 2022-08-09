# Boba Cross Chain Bridges

This contains: A simple script to deploy the bridges between Ethereum and Alt-L1s and a simple script to bridge tokens between Ethereum and Alt-L1s.

## Usage

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

  