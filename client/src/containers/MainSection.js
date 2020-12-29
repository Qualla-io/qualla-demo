import React from "react";
import { ethers } from "ethers";

import Web3Modal from "web3modal";
// import Fortmatic from "fortmatic";
// import WalletConnectProvider from "@walletconnect/web3-provider";
// import {
//   useReactiveVar,
// } from "@apollo/client";
import {
  accountVar,
  providerVar,
  signerVar,
  daiVar,
  subscriptionVar,
  ethVar,

} from "../cache";


import DaiContract from "../artifacts/contracts/TestDai.sol/TestDai.json";
import SubscriptionContract from "../artifacts/contracts/SubscriptionV1.sol/SubscriptionV1.json";

// const INIT_APP = gql`
//   query InitApp($id: ID!) {
//     user(id: $id) {
//       id
//       nonce
//       baseTokens {
//         id
//       }
//       subscribers {
//         id
//       }
//       subscriptions {
//         id
//       }
//     }
//   }
// `;

export default function MainSection(props) {
  // let account = useReactiveVar(accountVar);
  // let signer = useReactiveVar(signerVar);
  // const { loading, error, data } = useQueryWithAccount(INIT_APP);
  // const [initUser] = useMutation(CREATE_USER);

  // useEffect(() => {
  //   initWeb3();
  //   // eslint-disable-next-line
  // }, []);

  // if (loading) return <h1>Loading...</h1>;

  // if (error) return `Error! ${error}`;

  return (
    <>
      {/* <h1>{data?.user ? data.user.id : null}</h1> */}
      {props.children}
    </>
  );
}
