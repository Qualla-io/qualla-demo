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
import * as creatorActions from "../store/actions/CreatorActions";

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

  const dispatch = useDispatch();

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

  function updateCreator(key, value) {
    dispatch(creatorActions.updateCreator(key, value));
  }

  function updateContract() {
    dispatch(creatorActions.updateContract());
  }

  async function deployContract() {
    if (creatorState.contract.address) {
      let values = [];

      for (var i = 0; i < teirs.length; i++) {
        values.push(
          ethers.utils.parseUnits(teirs[i].value.toString(), "ether").toString()
        );
      }

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
      enqueueSnackbar(`Request Sent`, {
        variant: "success",
        autoHideDuration: 2000,
      });

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
          updateContract();
        })
        .catch((err) => {
          enqueueSnackbar(err.response.data.error, {
            variant: "error",
            autoHideDuration: 2000,
          });
        });
    } else {
      enqueueSnackbar(`Request Sent`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      axios
        .post("http://localhost:8080/deploy", {
          tiers: teirs,
          publisher: web3State.account,
        })
        .then((res) => {
          updateContract();
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
                  alignItems="stretch"
                  className={classes.fullHeightCard}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={addTeir}
                    className={classes.btn}
                  >
                    <AddIcon fontSize="large" />
                    Add Teir
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={subTeir}
                    className={classes.btn}
                  >
                    <RemoveIcon fontSize="large" />
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
}
