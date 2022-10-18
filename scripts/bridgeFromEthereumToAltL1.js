const { ethers } = require("ethers");
require("dotenv").config();

const ETHL1BridgeJson = require("../abi/ETHBridge.json");
const L2StandardERC20Json = require("../abi/L2StandardERC20.json");
const LZEndpointMockJson = require("../abi/LZEndpointMock.json");

const layerZerMainnet = require("../addresses/layerZeroMainnet.json");

const ETH_CHAIN_URL = process.env.ETH_CHAIN_URL || 'https://rpc.ankr.com/eth';
const TARGET_CHAIN_URL = process.env.TARGET_CHAIN_URL;
const TARGET_CHAIN_NAME = process.env.TARGET_CHAIN_NAME;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPOSIT_WALLET_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS;
const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || 1;

const main = async () => {
  if (!TARGET_CHAIN_URL) {
    throw new Error("Must pass TARGET_CHAIN_URL");
  }
  if (!TARGET_CHAIN_NAME) {
    throw new Error("Must pass TARGET_CHAIN_NAME");
  }
  if (!PRIVATE_KEY) {
    throw new Error("Must pass PRIVATE_KEY");
  }
  if (!DEPOSIT_WALLET_ADDRESS) {
    console.log("DEPOSIT_WALLET_ADDRESS not set, using address from PRIVATE_KEY");
  }
  if (!DEPOSIT_AMOUNT) {
    throw new Error("Must pass DEPOSIT_AMOUNT");
  }
  if (!['BNB', 'Fantom', 'Avalanche', 'Moonbeam'].includes(TARGET_CHAIN_NAME)) {
    throw new Error("Must pass valid TARGET_CHAIN_NAME - BNB, Fantom, Avalanche, Moonbeam");
  }

  // load layer zero config
  const ethLayerZeroConfig = layerZerMainnet.Layer_Zero_Protocol.Mainnet;
  const targetChainLayerZeroConfig = layerZerMainnet.Layer_Zero_Protocol[TARGET_CHAIN_NAME];

  // load bridge addresses
  const Proxy__EthBridgeAddress = layerZerMainnet.BOBA_Bridges.Mainnet[`Proxy__EthBridgeTo${TARGET_CHAIN_NAME}`];

  // load boba addresses
  const ethBOBAAddress = '0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc'
  const targetBOBAAddress = layerZerMainnet.BOBA_Bridges.Mainnet[`${TARGET_CHAIN_NAME}_TK_BOBA`];

  const ethWeb3 = new ethers.providers.JsonRpcProvider(ETH_CHAIN_URL);
  const altL1Webs = new ethers.providers.JsonRpcProvider(TARGET_CHAIN_URL);
  const ethWallet = new ethers.Wallet(PRIVATE_KEY).connect(
    ethWeb3
  );
  const targetAddress = !DEPOSIT_WALLET_ADDRESS ? ethWallet.address : DEPOSIT_WALLET_ADDRESS;

  if (targetAddress === ethers.constants.AddressZero) {
    throw new Error("Invalid targetAddress");
  }

  const Proxy__EthBridge = new ethers.Contract(
    Proxy__EthBridgeAddress,
    ETHL1BridgeJson.abi,
    ethWallet
  );

  const EthBOBA = new ethers.Contract(
    ethBOBAAddress,
    L2StandardERC20Json.abi,
    ethWallet
  );

  const AltL1BOBA = new ethers.Contract(
    targetBOBAAddress,
    L2StandardERC20Json.abi,
    altL1Webs
  );

  const ETHLayzerZeroEndpoint = new ethers.Contract(
    ethLayerZeroConfig.Layer_Zero_Endpoint,
    LZEndpointMockJson.abi,
    ethWallet
  );

  console.log(`-> Sending ${DEPOSIT_AMOUNT} BOBA tokens From ETH to ${TARGET_CHAIN_NAME}....`);

  // approve boba
  const approveTx = await EthBOBA.approve(Proxy__EthBridge.address, ethers.utils.parseEther(DEPOSIT_AMOUNT));
  await approveTx.wait();
  console.log(`-> Approved ${DEPOSIT_AMOUNT} BOBA tokens for transfer`);

  // estimate fee
  let payload = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address", "address", "uint256", "bytes"],
    [
      EthBOBA.address,
      AltL1BOBA.address,
      ethWallet.address,
      targetAddress,
      ethers.utils.parseEther(DEPOSIT_AMOUNT.toString()),
      "0x",
    ]
  );

  let estimatedFee = await ETHLayzerZeroEndpoint.estimateFees(
    targetChainLayerZeroConfig.Layer_Zero_ChainId,
    Proxy__EthBridge.address,
    payload,
    false,
    "0x"
  );
  console.log(`!!! Estimated fee: ${ethers.utils.formatEther(estimatedFee._nativeFee)} ETH !!!`);

  await Proxy__EthBridge.depositERC20To(
    EthBOBA.address,
    AltL1BOBA.address,
    targetAddress,
    ethers.utils.parseEther(DEPOSIT_AMOUNT.toString()),
    ethers.constants.AddressZero,
    "0x", // adapterParams
    "0x",
    { value: estimatedFee._nativeFee }
  );

  console.log(`-> Sent ${DEPOSIT_AMOUNT} BOBA tokens to the bridge contract....`);

  // wait for deposit to be relayed
  const postAltL1BOBABalance = await AltL1BOBA.balanceOf(targetAddress);
  let finalAltL1BOBABalance = await AltL1BOBA.balanceOf(targetAddress);

  while (finalAltL1BOBABalance.eq(postAltL1BOBABalance)) {
    await sleep(15000);
    finalAltL1BOBABalance = await AltL1BOBA.balanceOf(targetAddress);
    console.log(`-> Waiting for deposit to be relayed...`);
  }

  console.log(`\nSucceeded - BOBA Token is transferred to ${TARGET_CHAIN_NAME}!\n`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main();
