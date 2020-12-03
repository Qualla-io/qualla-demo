import React, {useState, useEffect} from "react";
import axios from "axios";
import {ethers} from "ethers";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Button, Typography} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import {gql, useReactiveVar, useMutation} from "@apollo/client";
import {
  accountVar,
  subscriptionVar,
  daiVar,
  signerVar,
  contractIDVar,
} from "../../../cache";

import TierCard from "./TierCard";

import {useSnackbar} from "notistack";
import {useQueryWithAccount} from "../../../hooks";

export const GET_USER_DETAILS = gql`
  query getUserDetails($id: ID!) {
    user(id: $id) {
      id
      username
      contract {
        id
        tiers {
          id
          title
          value
          perks
        }
        publisherNonce
        acceptedValues
        subscribers {
          subscriber {
            id
          }
          id
          value
          status
        }
        publisher {
          id
        }
        factory {
          id
          fee
        }
      }
    }
  }
`;

// const GET_CONTRACT_DETAILS = gql`
//   query getContractDetails($id: ID!) {
//     contract(id: $id) {
//       id
//       tiers {
//         id
//         title
//         value
//         perks
//       }
//       publisher {
//         id
//       }
//       factory {
//         fee
//         id
//       }
//       publisherNonce
//       acceptedValues
//       subscribers {
//         subscriber {
//           id
//         }
//         id
//         value
//         status
//       }
//     }
//   }
// `;

const DEPLOY_CONTRACT = gql`
  mutation createContract($publisher: ID!, $tiers: [TierInput!]!) {
    createContract(publisher: $publisher, tiers: $tiers) {
      id
      acceptedValues
      publisherNonce
      tiers {
        id
      }
      publisher {
        id
      }
      factory {
        id
        fee
      }
      subscribers {
        subscriber {
          id
        }
        id
        value
        status
      }
    }
  }
`;

const MODIFY_TIERS = gql`
  mutation modifyContractTiers($id: ID!, $tiers: [TierInput!]!) {
    modifyContractTiers(id: $id, tiers: $tiers) {
      id
      title
      value
      perks
    }
  }
`;

const MODIFY_CONTRACT = gql`
  mutation modifyContract(
    $id: String!
    $tiers: [TierInput!]!
    $signedHash: String!
  ) {
    modifyContract(id: $id, tiers: $tiers, signedHash: $signedHash) {
      id
      acceptedValues
      publisherNonce
      tiers {
        id
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

export default function CreatorLaunchCard() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  let contractID = useReactiveVar(contractIDVar);
  let subscription = useReactiveVar(subscriptionVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  const {error, loading, data} = useQueryWithAccount(GET_USER_DETAILS);
  let [deployContract] = useMutation(DEPLOY_CONTRACT);
  let [modifyTiers] = useMutation(MODIFY_TIERS);
  let [modifyContract] = useMutation(MODIFY_CONTRACT);
  const [tiers, setTiers] = useState([]);
  const {enqueueSnackbar} = useSnackbar();

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    if (!loading && data) {
      if (data?.user?.contract?.tiers) {
        let _tiers = JSON.parse(JSON.stringify(data.user.contract.tiers));

        _tiers.forEach(function (v) {
          delete v.__typename;
        });

        setTiers(_tiers);
      }
    }
  }, [loading, data]);

  useEffect(() => {
    if (data?.user?.contract && data.user.contract.id !== contractID) {
      contractIDVar(data.user.contract.id);
    }
  }, [contractID, data]);

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

      modifyContract({variables: {id: subscription.address, tiers, signedHash}})
        .then((data) => {
          console.log(data)
          modifyTiers({
            variables: {id: data.data.modifyContract.id, tiers},
            update(cache, {data: modifyContractTiers}) {
              let _tiers = modifyContractTiers.modifyContractTiers;

              let _tierList = [];
              let newTiersRef;
              for (var i = 0; i < _tiers.length; i++) {
                newTiersRef = cache.writeFragment({
                  data: _tiers[i],
                  fragment: gql`
                    fragment NewTier on Tier {
                      id
                      title
                      value
                      perks
                    }
                  `,
                });

                _tierList.push(newTiersRef);
              }



              cache.modify({
                id: cache.identify({
                  id: data.data.modifyContract.id,
                  __typename: "Contract",
                }),
                fields: {
                  tiers() {
                    return _tierList;
                  },
                },
              });

              cache.modify({
                id: cache.identify({
                  id: data.data.modifyContract.id,
                  __typename: "Contract",
                }),
                fields: {
                  publisherNonce() {
                    return data.data.modifyContract.publisherNonce;
                  },
                },
              });

              enqueueSnackbar("Modification Successful", {
                variant: "success",
              });
            },
          });
        })
        .then()
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
          modifyTiers({
            variables: {id: data.data.createContract.id, tiers},
            update(cache, {data: modifyContractTiers}) {
              let _tiers = modifyContractTiers.modifyContractTiers;

              let _tierList = [];
              let newTiersRef;
              for (var i = 0; i < _tiers.length; i++) {
                newTiersRef = cache.writeFragment({
                  data: _tiers[i],
                  fragment: gql`
                    fragment NewTier on Tier {
                      id
                      title
                      value
                      perks
                    }
                  `,
                });

                _tierList.push(newTiersRef);
              }

              cache.modify({
                id: cache.identify({
                  id: data.data.createContract.id,
                  __typename: "Contract",
                }),
                fields: {
                  tiers() {
                    return _tierList;
                  },
                },
              });

              cache.modify({
                id: cache.identify({
                  id: account.toLowerCase(),
                  __typename: "User",
                }),
                fields: {
                  contract() {
                    const newContractRef = cache.writeFragment({
                      data: data.data.createContract,
                      fragment: gql`
                        fragment NewContract on Contract {
                          id
                        }
                      `,
                    });
                    return newContractRef;
                  },
                },
              });

              contractIDVar(data.data.createContract.id);
            },
          });

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
