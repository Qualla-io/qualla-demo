import React, {useState, useEffect} from "react";

import {gql, useReactiveVar, useMutation, useQuery} from "@apollo/client";

import {useSnackbar} from "notistack";

import {ethers} from "ethers";
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

import TierCard from "../components/TierCard";

import {signPermit} from "../utils";
import {useQueryWithAccount} from "../../../hooks";
import {
  accountVar,
  subscriptionVar,
  daiVar,
  signerVar,
  contractIDVar,
  providerVar,
  ethVar,
} from "../../../cache";

import SubscriptionContract from "../../../contracts/SubscriptionV1.json";

const CreatorAddress = "0xe16449fAA5EFb9e334EeE36D68f7522F9Ded1D3f";


const PERMIT = gql`
  mutation sendPermit(
    $userID: ID!
    $contractID: ID!
    $nonce: String!
    $expiry: Float!
    $allowed: Boolean!
    $v: String!
    $r: String!
    $s: String!
  ) {
    permit(
      userID: $userID
      contractID: $contractID
      nonce: $nonce
      expiry: $expiry
      allowed: $allowed
      v: $v
      r: $r
      s: $s
    )
  }
`;

const SUBSCRIBE = gql`
  mutation subscribe(
    $contractID: ID!
    $userID: ID!
    $value: String!
    $signedHash: String!
  ) {
    subscribe(
      contractID: $contractID
      userID: $userID
      value: $value
      signedHash: $signedHash
    ) {
      id
      subscribers {
        id
        subscriber {
          id
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    justify: "center",
    alignItems: "center",
  },
}));

export default function TierContainer() {
  const classes = useStyles();
  // let dai = useReactiveVar(daiVar);
  // let signer = useReactiveVar(signerVar);
  let account = useReactiveVar(accountVar);
  // let eth = useReactiveVar(ethVar);
  // const {enqueueSnackbar} = useSnackbar();
  // const {_, __, userData} = useQueryWithAccount(GET_SUBSCRIBER_DETAILS);
  const {error, loading, data} = useQuery(GET_CREATOR_DETAILS, {
    variables: {id: CreatorAddress},
  });
  let [permit] = useMutation(PERMIT);
  let [subscribe] = useMutation(SUBSCRIBE);

  
  async function onSubscribe(value) {
    let nonce = await dai.nonces(account);

    nonce = nonce.toString();

    var message = {
      holder: account,
      spender: data?.user?.contract?.id,
      allowed: true,
      nonce,
      expiry: 0,
    };

    const res = await signPermit(eth, message, dai.address);

    console.log(res);

    enqueueSnackbar("Permit Request Sent", {
      variant: "success",
    });

    await permit({
      variables: {
        userID: account,
        contractID: data?.user?.contract?.id,
        nonce,
        expiry: 0,
        allowed: true,
        v: res.v.toString(),
        r: res.r.toString(),
        s: res.s.toString(),
      },
    });

    // let contractInstance = subsciberState.contractInstance;

    value = ethers.utils.parseUnits(value.toString(), "ether").toString();

    var subscriptionV1 = new ethers.Contract(
      data?.user?.contract?.id,
      SubscriptionContract.abi,
      signer
    );

    let hash = await subscriptionV1.getSubscriptionHash(
      account,
      value,
      dai.address,
      0, //nonce
      0 //status: ACTIVE
    );

    const signedHash = await signer.signMessage(ethers.utils.arrayify(hash));

    console.log(signedHash);

    subscribe({
      variables: {
        contractID: data?.user?.contract?.id,
        userID: account,
        value,
        signedHash,
      },
    })
      .then((data) => {
        enqueueSnackbar("Susbcription Successful", {
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar("Subscription processing error", {
          variant: "error",
        });
      });

    // axios
    //   .post(`http://localhost:8080/subscribe/`, {
    //     hash,
    //     signedHash,
    //     account,
    //     value,
    //     contract: contractInstance.address,
    //   })
    //   .then((res) => {})
    //   .catch((err) => {
    //     enqueueSnackbar("Subscription processing error", {
    //       variant: "error",
    //     });
    //   });
  }

  return (
    <Grid item container spacing={2} className={classes.card} justify="center">
      {data?.user?.contract?.tiers?.map((tier, i) => (
        <Grid item xs={12} md={3} lg={3} key={i}>
          <TierCard tier={tier} onSubscribe={onSubscribe} />
        </Grid>
      ))}
    </Grid>
  );
}