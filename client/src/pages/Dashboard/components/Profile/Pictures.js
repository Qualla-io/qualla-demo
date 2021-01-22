import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  CardHeader
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import AvatarIcons, { iconsLength } from "../../../../components/AvatarIcons";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import CoverPhoto, {
  coverPhotoLength,
} from "../../../../components/CoverPhotos";

const useStyles = makeStyles((theme) => ({
  avatarSelection: {
    display: "flex",
    justify: "center",
    alignItems: "center",
  },
  avatar: {
    height: 125,
    width: 125,
    backgroundColor: theme.palette.secondary.main,
  },
  avatarTitle: {
    display: "flex",
    justifyContent: "left",
    width: 300,
    marginBottom: theme.spacing(1),
  },
  icons: {
    fontSize: "4em",
  },
  newIcon: {
    fontSize: "8em",
    color: theme.palette.secondary.main,
  },
  arrowIcon: {
    fontSize: "8em",
    color: theme.palette.secondary.main,
    cursor: "pointer",
  },
  cover: {
    flexGrow: 1,
  },
  img: {
    width: "100%",
    overflow: "hidden",
  },
  description: { marginRight: theme.spacing(2) },
}));

export default function Pictures({ onPropsChange, userProps }) {
  const classes = useStyles();

  function incIcons() {
    if (userProps?.avatar < iconsLength) {
      onPropsChange("avatar", userProps.avatar + 1);
    } else {
      onPropsChange("avatar", 0);
    }
  }

  function decIcons() {
    if (userProps?.avatar > 0) {
      onPropsChange("avatar", userProps.avatar - 1);
    } else {
      onPropsChange("avatar", iconsLength);
    }
  }

  function incCover() {
    if (userProps?.coverPhoto < coverPhotoLength) {
      onPropsChange("coverPhoto", userProps.coverPhoto + 1);
    } else {
      onPropsChange("coverPhoto", 0);
    }
  }

  function decCover() {
    if (userProps?.coverPhoto > 0) {
      onPropsChange("coverPhoto", userProps.coverPhoto - 1);
    } else {
      onPropsChange("coverPhoto", coverPhotoLength);
    }
  }

  return (
    <Card>
      <CardHeader title="Profile Media" />
      <CardContent>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={3}
        >
          <Grid
            item
            xs
            container
            direction="row"
            justify="left"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <div
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Typography className={classes.description}>Avatar:</Typography>
              <div
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <KeyboardArrowLeftIcon
                  className={classes.arrowIcon}
                  onClick={decIcons}
                />
                <Avatar className={classes.avatar}>
                  <AvatarIcons
                    customProps={classes.icons}
                    i={userProps?.avatar}
                  />
                </Avatar>
                <KeyboardArrowRightIcon
                  className={classes.arrowIcon}
                  onClick={incIcons}
                />
              </div>
            </div>
          </Grid>
          <Grid
            item
            xs
            container
            direction="row"
            justify="left"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <div
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Typography className={classes.description}>
                Cover Photo:
              </Typography>
              <KeyboardArrowLeftIcon
                className={classes.arrowIcon}
                onClick={decCover}
              />
              <div className={classes.cover}>
                <img
                  src={CoverPhoto(userProps?.coverPhoto)}
                  alt=""
                  className={classes.img}
                />
              </div>
              <KeyboardArrowRightIcon
                className={classes.arrowIcon}
                onClick={incCover}
              />
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
