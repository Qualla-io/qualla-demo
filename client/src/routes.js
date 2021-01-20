import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const BaseRouter = () => (
  <Switch>
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/:creatorID" component={Profile} />
    <Redirect from="/" to="/dashboard" exact />
  </Switch>
);

export default BaseRouter;
