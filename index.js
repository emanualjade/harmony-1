const Web3 = require("web3");
const BN = require("bn.js");

PRIVATE_KEY = "";
MAINNET = "https://api.fuzz.fi";

// https://api.harmony.one/
// https://api.s0.t.hmny.io/
// https://a.api.s0.t.hmny.io/
// https://iad.api.harmony.one/
// https://api.fuzz.fi/ (usually the fastest)
// https://rpc.s0.t.hmny.io/ works too
const web3 = new Web3(MAINNET);

let masterAccount = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(masterAccount);
web3.eth.defaultAccount = masterAccount.address;

const myAddress = masterAccount.address;
const from = masterAccount.address;
const to = "0x2526ee3de8764965726e6c952e8cf846c342c094";

const getBalance = async (myAddress) => {
  const balance = await web3.eth.getBalance(myAddress);
  return balance / 1e18;
};

let interval;
const sendTransaction = async (currentBalance) => {
  try {
    // console.log("nonce: ", await web3.eth.getTransactionCount(account));
    // const nonce = '0x' + (await web3.eth.getTransactionCount(account) + counter).toString(16)

    // GAS PRICE AND LIMIT
    const gasPrice = new BN(await web3.eth.getGasPrice()).mul(new BN(1));
    const gasLimit = 6721900;
    // from the docs
    // GAS_LIMIT=3321900
    // GAS_PRICE=1000000000

    // BALANCE TO SEND
    const value = (currentBalance - 1) * 1e18; // 1 ONE
    console.log({ currentBalance, value });
    // TRANSACTION
    const result = await web3.eth
      .sendTransaction({
        from,
        to,
        value,
        gasPrice,
        gasLimit,
        nonce: await web3.eth.getTransactionCount(from, "pending"),
      })
      .on("error", console.error);
    startInterval();
    console.log(`Send tx: ${result.transactionHash} result: `, result.status);
  } catch (error) {
    startInterval();
    console.log(error);
  }
};

const startInterval = () => {
  interval = setInterval(async () => {
    try {
      const balance = await getBalance(myAddress);
      if (balance > 3) {
        clearInterval(interval);
        sendTransaction(balance);
      } else {
        console.log("Balance is low");
      }
    } catch (error) {
      console.log(error);
    }
  }, 2000);
};
startInterval();
