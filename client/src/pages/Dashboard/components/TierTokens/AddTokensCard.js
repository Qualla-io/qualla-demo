import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";
import React from "react";

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: "pointer",
    height: "100%",
    minHeight: 300,
  },
  content: {
    display: "flex",
    flexDirection: "Column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  },

  newIcon: {
    fontSize: "8em",
    color: theme.palette.secondary.main,
  },
}));

export default function AddTokensCard({ setModalOpen }) {
  const classes = useStyles();

  function handleOpen() {
    setModalOpen(true);
  }

  return (
    <Card onClick={handleOpen} className={classes.card}>
      <CardContent className={classes.content}>
        {" "}
        <AddBoxIcon className={classes.newIcon} />
        <Typography variant="h4">
          Mint New <br /> Tier Tokens
        </Typography>
      </CardContent>
    </Card>
  );
}
