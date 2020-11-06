import React, {useState, useEffect} from "react";
import axios from "axios";
import {ethers} from "ethers";
import {useSelector} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Button, Typography} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import TeirCard from "./TeirCard";

import {useSnackbar} from "notistack";

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

export default function CreatorLaunchCard() {
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const creatorState = useSelector((state) => state.CreatorReducer);
  const [teirs, setTeirs] = useState(creatorState.contract.tiers);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    setTeirs(creatorState.contract.tiers);
  }, [creatorState.contract]);

  function addTeir() {
    setTeirs([...teirs, {}]);
  }

  function subTeir() {
    setTeirs(teirs.slice(0, teirs.length - 1));
  }

  function onTeirChange(key, name, value) {
    let temp = [...teirs];
    let teir = temp[key];
    if (name === "value") {
      teir[name] = parseInt(value);
    } else {
      teir[name] = value;
    }
    temp[key] = teir;
    setTeirs(temp);
  }

  async function deployContract() {
    if (creatorState.contract.address) {
      let values = [];

      for (var i = 0; i < teirs.length; i++) {
        values.push(
          ethers.utils.parseUnits(teirs[i].value.toString(), "ether").toString()
        );
      }

      console.log(values);

      var nonce = parseInt(
        await creatorState.contractInstance.publisherNonce()
      );

      // get hash
      const hash = await creatorState.contractInstance.getPublisherModificationHash(
        [web3State.Dai.address],
        values,
        nonce++
      );

      // sign hash

      const signature = await web3State.signer.signMessage(
        ethers.utils.arrayify(hash)
      );

      console.log(signature);

      // modify contract

      axios
        .post(
          `http://localhost:8080/publishers/${web3State.account}/contract/`,
          {
            tiers: teirs,
            values,
            signature,
            publisher: web3State.account,
          }
        )
        .then((ans) => {
          enqueueSnackbar(`Modified Successfully`, {
            variant: "success",
            autoHideDuration: 2000,
          });
        })
        .catch((err) => {
          enqueueSnackbar(err.response.data.error, {
            variant: "error",
            autoHideDuration: 2000,
          });
        });
    } else {
      axios
        .post("http://localhost:8080/deploy", {
          tiers: teirs,
          publisher: web3State.account,
        })
        .then((res) => {
          enqueueSnackbar(`Your Contract Address: ${res.data}`, {
            variant: "success",
            autoHideDuration: 2000,
          });
        })
        .catch((err) => {
          enqueueSnackbar(err.response.data.error, {
            variant: "error",
            autoHideDuration: 2000,
          });
        });
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item component={Card} xs={10} className={classes.cont}>
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
              {creatorState.contract.address ? "Update" : "Launch"}
            </Button>
          </div>
          <Grid container justify="center" spacing={3}>
            {teirs.map((teir, i) => (
              <Grid item xs={3} key={i}>
                <TeirCard
                  num={i}
                  teir={teir}
                  className={classes.teir}
                  onTeirChange={onTeirChange}
                />
              </Grid>
            ))}
            <Grid item xs={3}>
              <Card className={classes.fullHeightCard} variant="outlined">
                <Grid
                  container
                  component={CardContent}
                  direction="column"
                  justify="center"
                  alignItems="space-between"
                  className={classes.fullHeightCard}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={addTeir}
                    className={classes.btn}
                  >
                    <AddIcon fontSize="Large" />
                    Add Teir
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={subTeir}
                    className={classes.btn}
                  >
                    <RemoveIcon fontSize="Large" />
                    Remove Teir
                  </Button>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Grid>
  );

  //     // <Grid container alignItems="stretch">
  //     // <Grid Item component={Card} xs={10}>
  //     //   <CardContent>
  //     //     <Typography variant="h6" className={classes.header}>
  //     //       Teirs
  //     //     </Typography>
  //     //     <Grid
  //     //       container
  //     //       spacing={7}
  //     //       justify="center"
  //     //       alignItems="center"
  //     //       // className={classes.cards}
  //     //     >
  //     //       <Grid Item component={Card}>
  //     //         <Typography>Test</Typography>
  //     //       </Grid>
  //     //       <Grid Item component={Card}>
  //     //         <Typography>Test</Typography>
  //     //       </Grid>

  //           {/* {teirs.map((teir, i) => (
  //               <Grid
  //                 Item
  //                 component={TeirCard}
  //                 key={i}
  //                 props={teir}
  //                 className={classes.teir}

  //               />
  //             ))} */}
  //           {/* <Grid Item component={Card} variant="outlined">
  //               <Grid container component={CardContent} direction="column">
  //                 <Button
  //                   style={{flexShrink: 1}}
  //                   variant="outlined"
  //                   color="primary"
  //                   onClick={addTeir}
  //                 >
  //                   <AddIcon fontSize="Large" />
  //                   Add Teir
  //                 </Button>
  //                 <Button
  //                   style={{flexShrink: 1}}
  //                   variant="outlined"
  //                   color="primary"
  //                   onClick={subTeir}
  //                 >
  //                   <RemoveIcon fontSize="Large" />
  //                   Remove Teir
  //                 </Button>
  //               </Grid>
  //             </Grid> */}
  //         {/* </Grid>
  //       </CardContent>
  //     </Grid> */}
  //     {/* // </Grid> */}
  //   );
}
