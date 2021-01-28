import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import SearchIcon from "@material-ui/icons/Search";

import { Hidden } from "@material-ui/core";
import TopBar from "./TopBar";
import UserBalance from "../../../components/UserBalance";

const drawerWidth = 240;

const creatorList = [
  { text: "Profile", link: "dashboard/profile", icon: <AccountBoxIcon /> },
  {
    text: "Tier Tokens",
    link: "dashboard/tiers",
    icon: <ConfirmationNumberIcon />,
  },
  {
    text: "Subscribers",
    link: "dashboard/subscribers",
    icon: <SupervisorAccountIcon />,
  },
  { text: "NFT Factory", link: "dashboard/nft", icon: <PaletteIcon /> },
];

const SubscriberList = [
  {
    text: "Subscriptions",
    link: "dashboard/subscriptions",
    icon: <AttachMoneyIcon />,
  },
  { text: "Gallery", link: "dashboard/gallery", icon: <AccountBalanceIcon /> },
  {
    text: "Find Creators",
    link: `${process.env.REACT_APP_CREATOR_ADDRESS}`,
    icon: <SearchIcon />,
  },
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
    [theme.breakpoints.down("sm")]: {
      borderTopRightRadius: 0,
    },
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
  text: {
    color: theme.palette.text.primary,
  },
}));

export default function SideDrawer(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const location = useLocation();


  const drawer = (
    <>
      <Typography variant="h4" className={classes.title}>
        <b>Qualla</b>
      </Typography>
      <div className={classes.section}>
        <List>
          {[{ text: "Dashboard", link: "", icon: <DashboardIcon /> }].map(
            (item, index) => (
              <ListItem
                button
                key={0}
                component={Link}
                to={`/${item.link}`}
                selected={location.pathname === `/${item.link}`}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  classes={{ text: classes.text }}
                />
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
              selected={location.pathname === `/${item.link}`}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Typography variant="subtitle1" className={classes.subtitle}>
          Subscriber
        </Typography>
        <List>
          {SubscriberList.map((item, index) => (
            <ListItem
              button
              key={index}
              component={Link}
              to={`/${item.link}`}
              selected={location.pathname === `/${item.link}`}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </div>
      <div className={classes.grow} />
      <div className={classes.bottom}>
        <UserBalance />
      </div>
    </>
  );

  const handleClose = () => {
    setOpen(false);
  };

  const openMenu = () => {
    setOpen(true);
  };

  return (
    <div className={classes.root}>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          classes={{
            paper: classes.drawerPaper,
          }}
          className={classes.drawer}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          {drawer}
        </Drawer>
      </Hidden>
      <div className={classes.content}>
        <TopBar openMenu={openMenu} />
        {props.children}
      </div>
    </div>
  );
}
