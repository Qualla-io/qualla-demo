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

import {gql, useReactiveVar, useQuery} from "@apollo/client";
import {accountVar} from "../../../cache";

import TierCard from "./TierCard";

import {useSnackbar} from "notistack";
import {useQueryWithAccount} from "../../../hooks";

const GET_CONTRACT_Details = gql`
  query getContractDetails($id: ID!) {
    contract(id: $id) {
      id
      tiers {
        title
        value
        perks
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
  {title: "Tier 2", value: "10", perks: "early access"},
];

export default function CreatorLaunchCard() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);

  const {error, loading, data} = useQueryWithAccount(GET_CONTRACT_Details);

  // useEffect(() => {
  //   if (account) {
  //     getContractDetails({variables: {id: account}});
  //   }
  // }, [account]);

  const [tiers, setTiers] = useState(initialTiers);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    if (data && data.contract) {
      console.log(data.contract.tiers);
      setTiers(data.contract.tiers);
    }
  }, [data]);

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

  async function updateContract() {}

  async function deployContract() {}

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
              onClick={deployContract}
            >
              {data && data.contract ? "Update" : "Launch"}
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
