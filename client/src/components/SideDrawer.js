import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import PaletteIcon from "@material-ui/icons/Palette";
import DashboardIcon from "@material-ui/icons/Dashboard";
import { Link } from "react-router-dom";
import MyBalance from "./MyBalance";

const drawerWidth = 240;

const creatorList = [
  { text: "Profile", link: "profile", icon: <AccountBoxIcon /> },
  { text: "Tier Tokens", link: "mint", icon: <ConfirmationNumberIcon /> },
  { text: "Subscribers", link: "subscribers", icon: <SupervisorAccountIcon /> },
  { text: "NFTs", link: "nft", icon: <PaletteIcon /> },
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: theme.palette.background.default,
    borderRight: 0,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  title: {
    textAlign: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  section: {
    // display: "flex",
    flexGrow: 1,
    borderTopRightRadius: 30,
    backgroundColor: "#be79df",
  },
  subtitle: {
    marginLeft: theme.spacing(3),
    marginBottom: -theme.spacing(1),
    // marginTop: theme.spacing(3),
  },
  grow: {
    margin: "auto auto",
  },
  bottom: {
    textAlign: "center",
    paddingBottom: theme.spacing(4),
    backgroundColor: "#be79df",
  },
}));

export default function SideDrawer(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <Typography variant="h4" className={classes.title}>
          <b>Qualla</b>
        </Typography>
        <div className={classes.section}>
          <List>
            {[{ text: "Dashboard", link: "", icon: <DashboardIcon /> }].map(
              (item, index) => (
                <ListItem button key={0} component={Link} to={`/${item.link}`}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            )}
          </List>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Creator
          </Typography>
          <List>
            {creatorList.map((item, index) => (
              <ListItem
                button
                key={index}
                component={Link}
                to={`/${item.link}`}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </div>
        <div className={classes.grow} />
        <div className={classes.bottom}>
          <MyBalance />
        </div>
      </Drawer>
      <div className={classes.content}>{props.children}</div>
    </div>
  );
}
