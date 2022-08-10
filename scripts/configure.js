/********************************************************/
/* This script is used to set up the block confirmation */
/********************************************************/

const { ethers } = require("ethers");
require("dotenv").config();

const AltL1BridgeJson = require("../abi/AltL1Bridge.json");
const ETHL1BridgeJson = require("../abi/ETHBridge.json");
const LZEndpointMockJson = require("../abi/LZEndpointMock.json");

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

const ETH_BLOCK_CONFIRMATIONS = process.env.ETH_BLOCK_CONFIRMATIONS;
const ALT_L1_BLOCK_CONFIRMATIONS = process.env.ALT_L1_BLOCK_CONFIRMATIONS;

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
  if (!ETH_BLOCK_CONFIRMATIONS) {
    throw new Error("Must pass ETH_BLOCK_CONFIRMATIONS");
  }
  if (!ALT_L1_BLOCK_CONFIRMATIONS) {
    throw new Error("Must pass ALT_L1_BLOCK_CONFIRMATIONS");
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

  const ETHLayzerZeroEndpoint = new ethers.Contract(
    LAYER_ZERO_ETH_ENDPOINT,
    LZEndpointMockJson.abi,
    ethWallet
  );
  const AltL1LayerZeroEndpoint = new ethers.Contract(
    LAYER_ZERO_TARGET_CHAIN_ENDPOINT,
    LZEndpointMockJson.abi,
    altL1Wallet
  );

  const EthBridgeOwner = await Proxy__EthBridge.owner();
  const AltL1BridgeOwner = await Proxy__AltL1Bridge.owner();

  if (EthBridgeOwner !== ethWallet.address) {
    throw new Error("EthBridgeOwner is not ETH_DEPLOYER_PRIVATE_KEY");
  }
  if (AltL1BridgeOwner !== altL1Wallet.address) {
    throw new Error("AltL1BridgeOwner is not ALT_L1_DEPLOYER_PRIVATE_KEY");
  }

  /*********************************************************************************/
  /* NOTE:                                                                        */
  /* ETHInboudBlockConfirmation has to be equal to AltL1OutboundBlockConfirmation  */
  /* ETHOutboundBlockConfirmation has to be eqaul to AltL1InboundBlockConfirmation */
  /* otherwise the bridge will not work                                            */
  /*********************************************************************************/

  const ETHInboudBlockConfirmation0x = await Proxy__EthBridge.getConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, ETHLayzerZeroEndpoint.address, 2)
  const ETHInboudBlockConfirmation = ethers.BigNumber.from(ETHInboudBlockConfirmation0x).toString()

  const ETHOutboundBlockConfirmation0x = await Proxy__EthBridge.getConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, ETHLayzerZeroEndpoint.address, 5)
  const ETHOutboundBlockConfirmation = ethers.BigNumber.from(ETHOutboundBlockConfirmation0x).toString()

  const AltL1InboundBlockConfirmation0x = await Proxy__AltL1Bridge.getConfig(0, LAYER_ZERO_ETH_CHAIN_ID, AltL1LayerZeroEndpoint.address, 2)
  const AltL1InboundBlockConfirmation = ethers.BigNumber.from(AltL1InboundBlockConfirmation0x).toString()

  const AltL1OutboundBlockConfirmation0x = await Proxy__AltL1Bridge.getConfig(0, LAYER_ZERO_ETH_CHAIN_ID, AltL1LayerZeroEndpoint.address, 5)
  const AltL1OutboundBlockConfirmation = ethers.BigNumber.from(AltL1OutboundBlockConfirmation0x).toString()

  console.log(`------------------------------------------------------`)
  console.log(`Block Confirmation Result: `)
  console.log({
    ETHInboudBlockConfirmation, ETHOutboundBlockConfirmation, AltL1InboundBlockConfirmation, AltL1OutboundBlockConfirmation
  })
  console.log(`------------------------------------------------------`)


  if (ETHOutboundBlockConfirmation !== ETH_BLOCK_CONFIRMATIONS || AltL1InboundBlockConfirmation !== ETH_BLOCK_CONFIRMATIONS) {
    console.log(`Setting ETHOutboundBlockConfirmation and AltL1InboundBlockConfirmation to ${ETH_BLOCK_CONFIRMATIONS}`)
    const ETHConfig = ethers.utils.defaultAbiCoder.encode(
      ["uint16"],
      [Number(ETH_BLOCK_CONFIRMATIONS)]
    )
    const SetETHOutboundTx = await Proxy__EthBridge.setConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, 5, ETHConfig)
    await SetETHOutboundTx.wait()
    const SetAltL1InboundTx = await Proxy__AltL1Bridge.setConfig(0, LAYER_ZERO_ETH_CHAIN_ID, 2, ETHConfig)
    await SetAltL1InboundTx.wait()
    console.log(`Verifying ETHOutboundBlockConfirmation and AltL1InboundBlockConfirmation`)
    const ETHOutboundBlockConfirmation0x = await Proxy__EthBridge.getConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, ETHLayzerZeroEndpoint.address, 5)
    const ETHOutboundBlockConfirmation = ethers.BigNumber.from(ETHOutboundBlockConfirmation0x).toString()
    const AltL1InboundBlockConfirmation0x = await Proxy__AltL1Bridge.getConfig(0, LAYER_ZERO_ETH_CHAIN_ID, AltL1LayerZeroEndpoint.address, 2)
    const AltL1InboundBlockConfirmation = ethers.BigNumber.from(AltL1InboundBlockConfirmation0x).toString()
    if (ETHOutboundBlockConfirmation !== AltL1InboundBlockConfirmation) {
      throw new Error(`ETHOutboundBlockConfirmation and AltL1InboundBlockConfirmation are not equal`)
    }
    console.log(`ETHOutboundBlockConfirmation and AltL1InboundBlockConfirmation were updated to ${ETHOutboundBlockConfirmation}`)
  }

  if (ETHInboudBlockConfirmation !== ALT_L1_BLOCK_CONFIRMATIONS || AltL1OutboundBlockConfirmation !== ALT_L1_BLOCK_CONFIRMATIONS) {
    console.log(`Setting ETHInboudBlockConfirmation and AltL1OutboundBlockConfirmation to ${ETH_BLOCK_CONFIRMATIONS}`)
    const ETHConfig = ethers.utils.defaultAbiCoder.encode(
      ["uint16"],
      [Number(ALT_L1_BLOCK_CONFIRMATIONS)]
    )
    const SetETHInboundTx = await Proxy__EthBridge.setConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, 2, ETHConfig)
    await SetETHInboundTx.wait()
    const SetAltL1OutboundTx = await Proxy__AltL1Bridge.setConfig(0, LAYER_ZERO_ETH_CHAIN_ID, 5, ETHConfig)
    await SetAltL1OutboundTx.wait()
    console.log(`Verifying ETHInboudBlockConfirmation and AltL1OutboundBlockConfirmation`)
    const ETHInboundBlockConfirmation0x = await Proxy__EthBridge.getConfig(0, LAYER_ZERO_ALT_L1_CHAIN_ID, ETHLayzerZeroEndpoint.address, 5)
    const ETHInboundBlockConfirmation = ethers.BigNumber.from(ETHInboundBlockConfirmation0x).toString()
    const AltL1OutboundBlockConfirmation0x = await Proxy__AltL1Bridge.getConfig(0, LAYER_ZERO_ETH_CHAIN_ID, AltL1LayerZeroEndpoint.address, 2)
    const AltL1OutboundBlockConfirmation = ethers.BigNumber.from(AltL1OutboundBlockConfirmation0x).toString()
    if (ETHInboundBlockConfirmation !== AltL1OutboundBlockConfirmation) {
      throw new Error(`ETHInboundBlockConfirmation and AltL1OutboundBlockConfirmation are not equal`)
    }
    console.log(`ETHInboundBlockConfirmation and AltL1OutboundBlockConfirmation were updated to ${ETHInboundBlockConfirmation}`)
  }
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main();
