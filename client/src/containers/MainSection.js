import React, {useEffect} from "react";
import {ethers} from "ethers";

import Web3Modal from "web3modal";
// import Fortmatic from "fortmatic";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  useQuery,
  gql,
  useReactiveVar,
  useLazyQuery,
  useMutation,
} from "@apollo/client";
import {
  accountVar,
  providerVar,
  signerVar,
  daiVar,
  factoryVar,
  subscriptionVar,
} from "../cache";
import {useQueryWithAccount} from "../hooks";

import DaiContract from "../contracts/TestDai.json";
import SubscriptionFactory from "../contracts/SubscriptionFactory.json";
import SubscriptionContract from "../contracts/SubscriptionV1.json";

const INIT_APP = gql`
  query InitApp($id: ID!) {
    user(id: $id) {
      id
      username
      contract {
        id
      }
    }
  }
`;


export default function MainSection(props) {
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  const {loading, error, data} = useQueryWithAccount(INIT_APP);
  // const [initUser] = useMutation(CREATE_USER);

  useEffect(() => {
    if (data?.user?.contract && signer) {
      var subscriptionV1 = new ethers.Contract(
        data.user.contract.id,
        SubscriptionContract.abi,
        signer
      );
      subscriptionVar(subscriptionV1);
    }
  }, [data, signer]);


  useEffect(() => {
    initWeb3();
    // eslint-disable-next-line
  }, []);

  async function initWeb3() {
    try {
      const providerOptions = {
        // fortmatic: {
        //   package: Fortmatic, // required
        //   options: {
        //     key: "FORTMATIC_KEY", // required
        //   },
        // },
        // walletconnect: {
        //   package: WalletConnectProvider, // required
        //   options: {
        //     infuraId: "INFURA_ID", // required
        //   },
        // },
      };

      const web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
      });
      const eth = await web3Modal.connect();

      // let web3 = await getWeb3();
      // updateWeb3("eth", eth);

      const provider = new ethers.providers.Web3Provider(eth);
      // const provider = new ethers.providers.JsonRpcProvider(
      //   "http://127.0.0.1:8545",
      //   // {chaindId: 5777, name: "local"}
      // );

      providerVar(provider);

      const signer = provider.getSigner();
      signerVar(signer);

      var deployedNetwork = DaiContract.networks[1337];
      var Dai = new ethers.Contract(
        deployedNetwork && deployedNetwork.address,
        DaiContract.abi,
        provider
      );

      Dai = Dai.connect(signer);
      daiVar(Dai);

      deployedNetwork = SubscriptionFactory.networks[1337];
      var Factory = new ethers.Contract(
        deployedNetwork && deployedNetwork.address,
        DaiContract.abi,
        provider
      );

      Factory = Factory.connect(signer);
      factoryVar(Factory);

      // // Use web3 to get the user's accounts.
      const account = await signer.getAddress();
      accountVar(account);

      const networkId = await provider.getNetwork();
      // updateWeb3("chainId", networkId.chainId);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  }

  if (loading) return <h1>Loading...</h1>;

  if (error) return `Error! ${error}`;

  return (
    <>
      <h1>{data?.user ? data.user.id : null}</h1>
      {props.children}
    </>
  );
}
