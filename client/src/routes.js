import React from "react";
import { Route, Switch } from "react-router-dom";

import Dashboard from "./pages/Landing";
import Mint from "./pages/Mint";
import Profile from "./pages/Profile";

const BaseRouter = () => (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    <Route exact path="/mint" component={Mint} />
    <Route path="/:creatorID" component={Profile} />
  </Switch>
);

export default BaseRouter;
