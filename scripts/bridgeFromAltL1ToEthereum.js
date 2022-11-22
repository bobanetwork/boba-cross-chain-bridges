const { ethers } = require("ethers");
require("dotenv").config();

const AltL1BridgeJson = require("../abi/AltL1Bridge.json");
const L2StandardERC20Json = require("../abi/L2StandardERC20.json");
const LZEndpointMockJson = require("../abi/LZEndpointMock.json");

const layerZerMainnet = require("../addresses/layerZeroMainnet.json");

const ETH_CHAIN_URL = process.env.ETH_CHAIN_URL || 'https://rpc.ankr.com/eth';
const ORIGIN_CHAIN_URL = process.env.ORIGIN_CHAIN_URL;
const ORIGIN_CHAIN_NAME = process.env.ORIGIN_CHAIN_NAME;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPOSIT_WALLET_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS;
const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || 1;

const main = async () => {
  if (!ORIGIN_CHAIN_URL) {
    throw new Error("Must pass ORIGIN_CHAIN_URL");
  }
  if (!ORIGIN_CHAIN_NAME) {
    throw new Error("Must pass ORIGIN_CHAIN_NAME");
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
  if (!['BNB', 'Fantom', 'Avalanche', 'Moonbeam'].includes(ORIGIN_CHAIN_NAME)) {
    throw new Error("Must pass valid ORIGIN_CHAIN_NAME - BNB, Fantom, Avalanche, Moonbeam");
  }

  // load layer zero config
  const ethLayerZeroConfig = layerZerMainnet.Layer_Zero_Protocol.Mainnet;
  const originChainLayerZeroConfig = layerZerMainnet.Layer_Zero_Protocol[ORIGIN_CHAIN_NAME];

  // load bridge addresses
  const Proxy__OriginBridgeAddress = layerZerMainnet.BOBA_Bridges.Mainnet[`Proxy__${ORIGIN_CHAIN_NAME}BridgeToEth`]

  // load boba addresses
  const ethBOBAAddress = '0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc'
  const originBOBAAddress = layerZerMainnet.BOBA_Bridges.Mainnet[`${ORIGIN_CHAIN_NAME}_TK_BOBA`];

  const ethWeb3 = new ethers.providers.JsonRpcProvider(ETH_CHAIN_URL);
  const altL1Webs = new ethers.providers.JsonRpcProvider(ORIGIN_CHAIN_URL);
  const altL1Wallet = new ethers.Wallet(PRIVATE_KEY).connect(
    altL1Webs
  );
  const targetAddress = !DEPOSIT_WALLET_ADDRESS ? altL1Wallet.address : DEPOSIT_WALLET_ADDRESS;

  if (targetAddress === ethers.constants.AddressZero) {
    throw new Error("Invalid targetAddress");
  }

  const Proxy__OriginBridge = new ethers.Contract(
    Proxy__OriginBridgeAddress,
    AltL1BridgeJson.abi,
    altL1Wallet
  );

  const EthBOBA = new ethers.Contract(
    ethBOBAAddress,
    L2StandardERC20Json.abi,
    ethWeb3
  );

  const AltL1BOBA = new ethers.Contract(
    originBOBAAddress,
    L2StandardERC20Json.abi,
    altL1Wallet
  );

  const OriginLayzerZeroEndpoint = new ethers.Contract(
    originChainLayerZeroConfig.Layer_Zero_Endpoint,
    LZEndpointMockJson.abi,
    altL1Wallet
  );

  console.log(`-> Sending ${DEPOSIT_AMOUNT} BOBA tokens From ${ORIGIN_CHAIN_NAME} to ETH....`);

  // approve boba
  const approveTx = await AltL1BOBA.approve(Proxy__OriginBridge.address, ethers.utils.parseEther(DEPOSIT_AMOUNT));
  await approveTx.wait();
  console.log(`-> Approved ${DEPOSIT_AMOUNT} BOBA tokens for transfer`);

  // estimate fee
  let payload = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address", "address", "uint256", "bytes"],
    [
      AltL1BOBA.address,
      EthBOBA.address,
      altL1Wallet.address,
      targetAddress,
      ethers.utils.parseEther(DEPOSIT_AMOUNT.toString()),
      "0x",
    ]
  );

  let estimatedFee = await OriginLayzerZeroEndpoint.estimateFees(
    ethLayerZeroConfig.Layer_Zero_ChainId,
    Proxy__OriginBridge.address,
    payload,
    false,
    "0x"
  );
  console.log(`!!! Estimated fee: ${ethers.utils.formatEther(estimatedFee._nativeFee)} ${ORIGIN_CHAIN_NAME} !!!`);

  await Proxy__OriginBridge.withdrawTo(
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
  const postEthL1BOBABalance = await EthBOBA.balanceOf(targetAddress);
  let finalEthL1BOBABalance = await EthBOBA.balanceOf(targetAddress);

  while (finalEthL1BOBABalance.eq(postEthL1BOBABalance)) {
    await sleep(15000);
    finalEthL1BOBABalance = await EthBOBA.balanceOf(targetAddress);
    console.log(`-> Waiting for deposit to be relayed...`);
  }

  console.log(`\nSucceeded - BOBA Token is transferred to Eth!\n`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main();
