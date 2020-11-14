import React, {useState, useEffect} from "react";
import axios from "axios";
import {ethers} from "ethers";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Button, Typography} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import * as creatorActions from "../../../store/actions/CreatorActions";

import {gql, useReactiveVar, useMutation} from "@apollo/client";
import {accountVar, subscriptionVar, daiVar, signerVar} from "../../../cache";

import TierCard from "./TierCard";

import {useSnackbar} from "notistack";
import {useQueryWithAccount} from "../../../hooks";

const GET_CONTRACT_DETAILS = gql`
  query getContractDetails($id: ID!) {
    user(id: $id) {
      id
      contract {
        id
        tiers {
          title
          value
          perks
        }
        publisherNonce
      }
    }
  }
`;

const DEPLOY_CONTRACT = gql`
  mutation createContract($publisher: String!, $tiers: [TierInput!]!) {
    createContract(publisher: $publisher, tiers: $tiers) {
      id
      acceptedValues
      tiers {
        title
        value
        perks
      }
      publisher {
        id
        contract {
          id
          tiers {
            title
            value
            perks
          }
        }
      }
    }
  }
`;

const MODIFY_CONTRACT = gql`
  mutation modifyContract(
    $publisher: String!
    $tiers: [TierInput!]!
    $signedHash: String!
  ) {
    modifyContract(
      publisher: $publisher
      tiers: $tiers
      signedHash: $signedHash
    ) {
      id
      acceptedValues
      tiers {
        title
        value
        perks
      }
      publisher {
        id
        contract {
          id
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  cont: {
    padding: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
    margin: "auto",
    display: "flex",
    direction: "row",
    alignItems: "center",
  },
  launch: {
    marginRight: theme.spacing(2),
    borderRadius: 100,
  },
  header: {
    marginBottom: theme.spacing(4),
    flexShrink: 1,
  },
  cards: {
    flexGrow: 1,
  },
  fullHeightCard: {
    height: "100%",
  },
  btn: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const initialTiers = [
  {title: "Tier 1", value: "5", perks: "ad free"},
  {title: "Tier 5", value: "10", perks: "premium content"},
];

const testTiers = [
  {title: "Tier 1", value: "5", perks: "ad free"},
  {title: "Tier 2", value: "10", perks: "tits"},
  {title: "Tier 3", value: "10", perks: "tits"},
];

export default function CreatorLaunchCard() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  let subscription = useReactiveVar(subscriptionVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  const {error, loading, data} = useQueryWithAccount(GET_CONTRACT_DETAILS);
  let [deployContract] = useMutation(DEPLOY_CONTRACT);
  let [modifyContract] = useMutation(MODIFY_CONTRACT);
  const [tiers, setTiers] = useState([]);
  const {enqueueSnackbar} = useSnackbar();

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    if (!loading && data) {
      if (data.user && data.user.contract && data.user.contract.tiers) {
        let _tiers = JSON.parse(JSON.stringify(data.user.contract.tiers));

        _tiers.forEach(function (v) {
          delete v.__typename;
        });

        setTiers(_tiers);
      }
    }
  }, [loading, data]);

  // useEffect(() => {
  //   if (!data || !data.user || !data.user.contract) {
  //     console.log("ran");
  //     setTiers([initialTiers]);
  //   }
  // }, []);

  function addTier() {
    setTiers([...tiers, {}]);
  }

  function subTier() {
    setTiers(tiers.slice(0, tiers.length - 1));
  }

  function onTierChange(key, name, value) {
    let temp = [...tiers];
    let tier = temp[key];
    if (name === "value") {
      tier[name] = parseInt(value);
    } else {
      tier[name] = value;
    }
    temp[key] = tier;
    setTiers(temp);
  }

  // function updateContract() {
  //   dispatch(creatorActions.updateContract());
  // }

  async function _modifyContract() {
    if (account && subscription) {
      let values = [];

      for (var i = 0; i < tiers.length; i++) {
        values.push(
          ethers.utils.parseUnits(tiers[i].value.toString(), "ether").toString()
        );
      }

      var nonce = data.user.contract.publisherNonce;

      // get hash
      const hash = await subscription.getPublisherModificationHash(
        [dai.address],
        values,
        nonce++
      );

      // sign hash

      const signedHash = await signer.signMessage(ethers.utils.arrayify(hash));

      modifyContract({variables: {publisher: account, tiers, signedHash}})
        .then((data) => {
          enqueueSnackbar("Modification Successful", {
            variant: "success",
          });
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
          enqueueSnackbar(`${err.message}`, {
            variant: "error",
          });
        });
    } else {
      enqueueSnackbar("No account", {
        variant: "error",
      });
    }
  }

  async function _deployContract() {
    if (account) {
      deployContract({
        variables: {publisher: account, tiers},
      })
        .then((data) => {
          enqueueSnackbar("Deployment Successful", {
            variant: "success",
          });
        })
        .catch((err) => {
          console.log(err);
          enqueueSnackbar(`${err.message}`, {
            variant: "error",
          });
        });

      enqueueSnackbar("Deployment Processing", {
        variant: "success",
      });
    } else {
      enqueueSnackbar("No account", {
        variant: "error",
      });
    }
  }

  // async function deployContract() {
  //   if (creatorState.contract.address) {
  //     let values = [];

  //     for (var i = 0; i < tiers.length; i++) {
  //       values.push(
  //         ethers.utils.parseUnits(tiers[i].value.toString(), "ether").toString()
  //       );
  //     }

  //     var nonce = parseInt(
  //       await creatorState.contractInstance.publisherNonce()
  //     );

  //     // get hash
  //     const hash = await creatorState.contractInstance.getPublisherModificationHash(
  //       [web3State.Dai.address],
  //       values,
  //       nonce++
  //     );

  //     // sign hash

  //     const signature = await web3State.signer.signMessage(
  //       ethers.utils.arrayify(hash)
  //     );

  //     console.log(signature);

  //     // modify contract
  //     enqueueSnackbar(`Request Sent`, {
  //       variant: "success",
  //       autoHideDuration: 2000,
  //     });

  //     axios
  //       .post(
  //         `http://localhost:8080/publishers/${web3State.account}/contract/`,
  //         {
  //           tiers: tiers,
  //           values,
  //           signature,
  //           publisher: web3State.account,
  //         }
  //       )
  //       .then((ans) => {
  //         enqueueSnackbar(`Modified Successfully`, {
  //           variant: "success",
  //           autoHideDuration: 2000,
  //         });
  //         updateContract();
  //       })
  //       .catch((err) => {
  //         enqueueSnackbar(err.response.data.error, {
  //           variant: "error",
  //           autoHideDuration: 2000,
  //         });
  //       });
  //   } else {
  //     enqueueSnackbar(`Request Sent`, {
  //       variant: "success",
  //       autoHideDuration: 2000,
  //     });
  //     axios
  //       .post("http://localhost:8080/deploy", {
  //         tiers: tiers,
  //         publisher: web3State.account,
  //       })
  //       .then((res) => {
  //         updateContract();
  //         enqueueSnackbar(`Your Contract Address: ${res.data}`, {
  //           variant: "success",
  //           autoHideDuration: 2000,
  //         });
  //       })
  //       .catch((err) => {
  //         enqueueSnackbar(err.response.data.error, {
  //           variant: "error",
  //           autoHideDuration: 2000,
  //         });
  //       });
  //   }
  // }

  return (
    <Grid container spacing={2}>
      <Grid item component={Card} lg={10} xs={12} className={classes.cont}>
        <CardContent>
          <div className={classes.grow}>
            <Typography variant="h6" className={classes.header}>
              Tiers
            </Typography>
            <div className={classes.grow} />
            <Button
              variant="contained"
              color="secondary"
              onClick={
                data && data.user && data.user.contract
                  ? _modifyContract
                  : _deployContract
              }
            >
              {data && data.user && data.user.contract ? "Update" : "Launch"}
            </Button>
          </div>
          <Grid container justify="center" spacing={3}>
            {tiers.map((tier, i) => (
              <Grid item lg={3} md={6} xs={12} key={i}>
                <TierCard
                  num={i}
                  tier={tier}
                  className={classes.tier}
                  onTierChange={onTierChange}
                />
              </Grid>
            ))}
            <Grid item lg={3} md={6} xs={12}>
              <Card className={classes.fullHeightCard} variant="outlined">
                <Grid
                  container
                  component={CardContent}
                  direction="column"
                  justify="center"
                  alignItems="stretch"
                  className={classes.fullHeightCard}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={addTier}
                    className={classes.btn}
                  >
                    <AddIcon fontSize="large" />
                    Add Tier
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={subTier}
                    className={classes.btn}
                  >
                    <RemoveIcon fontSize="large" />
                    Remove Tier
                  </Button>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Grid>
  );
}
