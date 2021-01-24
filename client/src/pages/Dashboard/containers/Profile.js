import { useMutation, useReactiveVar } from "@apollo/client";
import {
  Grid,
  Hidden,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useQueryWithAccount } from "../../../hooks";
import BasicInfo from "../components/Profile/BasicInfo";
import Pictures from "../components/Profile/Pictures";
import { GET_USER_DETAILS, UPDATE_USER } from "../components/Profile/queries";
import { accountVar } from "../../../cache";
import { Link } from "react-router-dom";
import CheckOff from "../components/Profile/CheckOff";
import InfoCard from "../components/Profile/InfoCard";

const useStyles = makeStyles((theme) => ({
  main: {
    // flexGrow: 1,
    marginTop: theme.spacing(2),
  },
  btn: {
    backgroundColor: theme.palette.tertiary.main,
    width: "100%",
    marginBottom: theme.spacing(2),
  },
}));

export default function Profile() {
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let [changed, setChanged] = useState(false);
  let [url, setUrl] = useState(null);
  let { data } = useQueryWithAccount(GET_USER_DETAILS);
  let [update] = useMutation(UPDATE_USER);
  const classes = useStyles();
  const [userProps, setUserProps] = useState({
    avatar: null,
    username: "",
    coverPhoto: null,
    url: null,
    description: "",
  });

  useEffect(() => {
    if (data?.user) {
      setUserProps(data.user);
      setUrl(data?.user?.url);
    }
  }, [data]);

  function onPropsChange(name, value) {
    let temp = { ...userProps };
    temp[name] = value;
    setUserProps(temp);
    setChanged(true);
  }

  function _update() {
    const { username, avatar, url, coverPhoto, description } = userProps;
    update({
      variables: {
        id: account,
        username,
        url,
        coverPhoto,
        avatar,
        description,
      },
    })
      .then((res) => {
        enqueueSnackbar(`Update Successful`, {
          variant: "success",
        });
        setChanged(false);
        setUrl(url);
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "warning",
        });
      });
  }

  const btns = () => {
    return (
      <>
        <Button
          variant="contained"
          className={classes.btn}
          component={Link}
          to={`/${url}`}
          disabled={url === null}
        >
          <Typography variant="h6">See Profile</Typography>
        </Button>
        <Button
          variant="contained"
          className={classes.btn}
          disabled={!changed}
          onClick={_update}
        >
          <Typography variant="h6"> Save Changes</Typography>
        </Button>
      </>
    );
  };

  return (
    <Grid container spacing={2} className={classes.main}>
      <Grid item md={8} xs={12} container spacing={2} direction="column">
        <Hidden mdUp>
          <Grid item xs={12}>
            {btns()}
          </Grid>
        </Hidden>
        <Grid item xs={12}>
          <BasicInfo onPropsChange={onPropsChange} userProps={userProps} />
        </Grid>
        <Grid item xs={12}>
          <Pictures onPropsChange={onPropsChange} userProps={userProps} />
        </Grid>
      </Grid>
      <Grid item md={4} container spacing={2} direction="column">
        <Hidden smDown>
          <Grid item>{btns()}</Grid>
        </Hidden>
        <Grid item>
          <CheckOff userProps={userProps} />
        </Grid>
        <Hidden smDown>
          <Grid item>
            <InfoCard style={{ height: "100%" }} />
          </Grid>
        </Hidden>
      </Grid>
    </Grid>
  );
}
