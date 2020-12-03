import Web3 from "web3";

const createPermitMessageData = function (message, coinAddr) {
  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: "Dai Stablecoin",
      version: "1",
      chainId: 1337,
      verifyingContract: coinAddr,
    },
    message: message,
  });

  return {
    typedData,
    message,
  };
};

const signData = async function (eth, fromAddress, typeData) {
  return new Promise(function (resolve, reject) {
    let web3 = new Web3(window.ethereum);
    console.log(web3)
    web3.currentProvider.send(
      {
        id: 1,
        method: "eth_signTypedData_v3",
        params: [fromAddress, typeData],
        from: fromAddress,
      },
      function (err, result) {
        if (err) {
          reject(err); //TODO
        } else {
          const r = result.result.slice(0, 66);
          const s = "0x" + result.result.slice(66, 130);
          const v = Number("0x" + result.result.slice(130, 132));
          resolve({
            v,
            r,
            s,
          });
        }
      }
    );
  });
};

export const signPermit = async function (web3, message, coinAddr) {
  // if (message.nonce === undefined) {
  //   let tokenAbi = ["function nonces(address holder) view returns (uint)"];

  //   let tokenContract = new web3.eth.Contract(tokenAbi, coinAddr);

  //   let nonce = await tokenContract.nonces(message.holder);

  //   message = { ...message, nonce: nonce.toString() };
  // }

  const messageData = createPermitMessageData(message, coinAddr);
  const sig = await signData(web3, message.holder, messageData.typedData);
  return Object.assign({}, sig, messageData.message);
};
