/**********************************************************/
/* This script is used to update the bridge from v1 to v2 */
/**********************************************************/

const { ethers } = require("ethers");
require("dotenv").config();

const AltL1BridgeJson = require("../abi/AltL1Bridge.json");
const ETHL1BridgeJson = require("../abi/ETHBridge.json");
const Lib_ResolvedDelegateProxyJson = require("../abi/Lib_ResolvedDelegateProxy.json");

const ETH_CHAIN_URL = process.env.ETH_CHAIN_URL;
const TARGET_CHAIN_URL = process.env.TARGET_CHAIN_URL;

const LAYER_ZERO_ETH_ENDPOINT = process.env.LAYER_ZERO_ETH_ENDPOINT;
const LAYER_ZERO_TARGET_CHAIN_ENDPOINT =
  process.env.LAYER_ZERO_TARGET_CHAIN_ENDPOINT;
const LAYER_ZERO_ETH_CHAIN_ID = process.env.LAYER_ZERO_ETH_CHAIN_ID;
const LAYER_ZERO_ALT_L1_CHAIN_ID = process.env.LAYER_ZERO_ALT_L1_CHAIN_ID;

const ETH_DEPLOYER_PRIVATE_KEY = process.env.ETH_DEPLOYER_PRIVATE_KEY;
const ALT_L1_DEPLOYER_PRIVATE_KEY = process.env.ALT_L1_DEPLOYER_PRIVATE_KEY;

const PROXY_ETH_L1_BRIDGE_ADDRESS = process.env.PROXY_ETH_L1_BRIDGE_ADDRESS;
const PROXY_ALT_L1_BRIDGE_ADDRESS = process.env.PROXY_ALT_L1_BRIDGE_ADDRESS;

const ETH_L1_BRIDGE_ADDRESS = process.env.ETH_L1_BRIDGE_ADDRESS;
const ALT_L1_BRIDGE_ADDRESS = process.env.ALT_L1_BRIDGE_ADDRESS;

const main = async () => {
  if (!ETH_CHAIN_URL) {
    throw new Error("Must pass ETH_CHAIN_URL");
  }
  if (!TARGET_CHAIN_URL) {
    throw new Error("Must pass TARGET_CHAIN_URL");
  }
  if (!LAYER_ZERO_ETH_ENDPOINT) {
    throw new Error("Must pass LAYER_ZERO_ETH_ENDPOINT");
  }
  if (!LAYER_ZERO_TARGET_CHAIN_ENDPOINT) {
    throw new Error("Must pass LAYER_ZERO_TARGET_CHAIN_ENDPOINT");
  }
  if (!LAYER_ZERO_ETH_CHAIN_ID) {
    throw new Error("Must pass LAYER_ZERO_ETH_CHAIN_ID");
  }
  if (!LAYER_ZERO_ALT_L1_CHAIN_ID) {
    throw new Error("Must pass LAYER_ZERO_ALT_L1_CHAIN_ID");
  }
  if (!PROXY_ETH_L1_BRIDGE_ADDRESS) {
    throw new Error("Must pass PROXY_ETH_L1_BRIDGE_ADDRESS");
  }
  if (!PROXY_ALT_L1_BRIDGE_ADDRESS) {
    throw new Error("Must pass PROXY_ALT_L1_BRIDGE_ADDRESS");
  }
  if (!ETH_DEPLOYER_PRIVATE_KEY) {
    throw new Error("Must pass ETH_DEPLOYER_PRIVATE_KEY");
  }
  if (!ALT_L1_DEPLOYER_PRIVATE_KEY) {
    throw new Error("Must pass ALT_L1_DEPLOYER_PRIVATE_KEY");
  }

  const ethWeb3 = new ethers.providers.JsonRpcProvider(ETH_CHAIN_URL);
  const altL1Webs = new ethers.providers.JsonRpcProvider(TARGET_CHAIN_URL);
  const ethWallet = new ethers.Wallet(ETH_DEPLOYER_PRIVATE_KEY).connect(
    ethWeb3
  );
  const altL1Wallet = new ethers.Wallet(ALT_L1_DEPLOYER_PRIVATE_KEY).connect(
    altL1Webs
  );

  const Proxy__EthBridge = new ethers.Contract(
    PROXY_ETH_L1_BRIDGE_ADDRESS,
    ETHL1BridgeJson.abi,
    ethWallet
  );

  const Proxy__AltL1Bridge = new ethers.Contract(
    PROXY_ALT_L1_BRIDGE_ADDRESS,
    AltL1BridgeJson.abi,
    altL1Wallet
  );

  if (!ETH_L1_BRIDGE_ADDRESS) {
    console.log(`Deploying ETH L1 Bridge`);
    const Factory__EthBridge = new ethers.ContractFactory(
      ETHL1BridgeJson.abi,
      ETHL1BridgeJson.bytecode,
      ethWallet
    );
    const EthBridge = await Factory__EthBridge.deploy();
    await EthBridge.deployTransaction.wait();
    console.log(`EthBridge deployed to: ${EthBridge.address}`);

    const Proxy__EthBridge = new ethers.Contract(
      PROXY_ETH_L1_BRIDGE_ADDRESS,
      Lib_ResolvedDelegateProxyJson.abi,
      ethWallet
    )

    const updateProxy__EthBridgeTx = await Proxy__EthBridge.setTargetContract(
      EthBridge.address
    )
    await updateProxy__EthBridgeTx.wait()
  }

  if (!ALT_L1_BRIDGE_ADDRESS) {
    console.log(`Deploying Alt L1 Bridge`);
    const Factory__AltL1Bridge = new ethers.ContractFactory(
      AltL1BridgeJson.abi,
      AltL1BridgeJson.bytecode,
      altL1Wallet
    );
    const AltL1Bridge = await Factory__AltL1Bridge.deploy();
    await AltL1Bridge.deployTransaction.wait();
    console.log(`AltL1Bridge deployed to: ${AltL1Bridge.address}`);

    const Proxy__AltL1Bridge = new ethers.Contract(
      PROXY_ALT_L1_BRIDGE_ADDRESS,
      Lib_ResolvedDelegateProxyJson.abi,
      altL1Wallet
    )

    const updateProxy__AltL1BridgeTx = await Proxy__AltL1Bridge.setTargetContract(
      AltL1Bridge.address
    )
    await updateProxy__AltL1BridgeTx.wait()
  }

  let ethRemoteChainId = ethers.BigNumber.from(LAYER_ZERO_ALT_L1_CHAIN_ID);
  let ethTrustedRemote = ethers.utils.solidityPack(
    ['address','address'],
    [PROXY_ALT_L1_BRIDGE_ADDRESS, PROXY_ETH_L1_BRIDGE_ADDRESS]
  );

  const updateEthBridgeTx = await Proxy__EthBridge.setTrustedRemote(ethRemoteChainId, ethTrustedRemote)
  await updateEthBridgeTx.wait()
  const updateDstChainIdTx = await Proxy__EthBridge.setDstChainId(ethRemoteChainId)
  await updateDstChainIdTx.wait()

  console.log(`Updated ETH L1 Bridge`);

  let altL1RemoteChainId = ethers.BigNumber.from(LAYER_ZERO_ETH_CHAIN_ID);
  let altL1TrustedRemote = ethers.utils.solidityPack(
    ['address','address'],
    [PROXY_ETH_L1_BRIDGE_ADDRESS, PROXY_ALT_L1_BRIDGE_ADDRESS]
  );

  const updateAltL1BridgeTx = await Proxy__AltL1Bridge.setTrustedRemote(altL1RemoteChainId, altL1TrustedRemote)
  await updateAltL1BridgeTx.wait()
  const updateAltL1DstChainIdTx = await Proxy__AltL1Bridge.setDstChainId(altL1RemoteChainId)
  await updateAltL1DstChainIdTx.wait()

  console.log(`Updated Alt L1 Bridge`);
}

main();