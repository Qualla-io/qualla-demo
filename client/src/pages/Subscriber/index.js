import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";

import Container from "@material-ui/core/Container";
import HeroImage from "./components/HeroImage";
import CreatorAvatar from "./components/CreatorAvatar";
import {Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import TierContainer from "./components/TierContainer";

import * as subsciberActions from "../../store/actions/SubscriberActions";

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tierTitle: {
    marginTop: theme.spacing(5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Subscriber() {
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const subsciberState = useSelector((state) => state.SubscriberReducer);

  const dispatch = useDispatch();

  useEffect(() => {
    updateContract();
  }, [web3State.signer]);

  function updateContract() {
    dispatch(subsciberActions.updateContract());
  }

  return (
    <>
      <HeroImage />
      <Container>
        <CreatorAvatar />
        <Typography variant="h2" className={classes.heading}>
          Qualla
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          A decentralized platorm for creators to take control
        </Typography>
        <Typography variant="h5" className={classes.tierTitle}>
          Select a supporter tier:
        </Typography>
        <TierContainer />
      </Container>
    </>
  );
}
