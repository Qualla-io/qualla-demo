import React from "react";

import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

export default function Landing() {
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item>
          <Button
            component={Link}
            to="/subscriber"
            variant="contained"
            color="primary"
          >
            Subscriber
          </Button>
        </Grid>
        <Grid item>
          <Button
            component={Link}
            to="/publisher"
            variant="contained"
            color="primary"
          >
            Publisher
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
