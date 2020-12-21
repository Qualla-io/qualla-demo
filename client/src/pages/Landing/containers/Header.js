import React, { useState, useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import { Typography, Link, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";

import { useReactiveVar, useMutation } from "@apollo/client";
import { accountVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import HeaderCard from "../components/HeaderCard";

import {GET_USER_HEADER, UPDATE_USERNAME} from "../queries"

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: "10em",
  },
  header: {
    marginTop: theme.spacing(8),
    width: "100%",
    height: "100%",
    position: "relative",
  },
  card: {
    // marginRight: -10,
  },
  username: {
    display: "flex",
    flexDirection: "column",
    justifyItems: "center",
    height: "100%",
    position: "absoulute",
    maxWidth: 500,
    overflow: "hidden"
  },
  input: {
    fontSize: theme.typography.h4,
  },
}));

export default function Header() {
  const [edit, setEdit] = useState(false);
  const [_username, setUsername] = useState(null)
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  let {data} = useQueryWithAccount(GET_USER_HEADER)
  let [updateUsername] = useMutation(UPDATE_USERNAME)


  useEffect(() => {
    console.log(data)
  }, [data])

  const editName = () => {setEdit(!edit)};

  const handleChange = (e) => {
      setUsername(e.target.value)
  }

  const _updateUsername = () => {

    updateUsername({variables: {id: account, username: _username}})

    editName()
  }

  return (
    <Grid
      container
      className={classes.header}
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <AccountCircleRoundedIcon className={classes.icon} />
      </Grid>
      <Grid item className={classes.username}>
        {edit ? (
          <TextField
            size="medium"
            defaultValue={data?.user?.username}
            className={classes.input}
            onChange={handleChange}
          />
        ) : (
          <Typography variant="h4" >
            <b>{data?.user?.username?.length > 24 ? account?.slice(0, 8) + "..." + account?.slice(-8) : data?.user?.username}</b>
          </Typography>
        )}

        <Typography variant="subtitle1">
          {account?.slice(0, 8)}...{account?.slice(-8)}
        </Typography>
        {edit ? (
          <Link onClick={_updateUsername} component={Typography}>
            save
          </Link>
        ) : (
          <Link onClick={editName} component={Typography}>
            edit
          </Link>
        )}
      </Grid>
      <Grid item xs />
      <Grid item>
        <HeaderCard className={classes.card} />
      </Grid>
    </Grid>
  );
}
