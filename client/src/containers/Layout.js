import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import Topbar from "../components/Topbar.js";


const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexFlow: "column",
    },
  }));

export default function Layout(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Topbar />
            
            {props.children}
            
        </div>
    )
}