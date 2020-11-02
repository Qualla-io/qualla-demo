import React from "react";
import { Route, Switch } from "react-router-dom";

import Landing from "./pages/Landing";

const BaseRouter = () => (
  <Switch>
    <Route exact path="/" component={Landing} />
    {/* <Route exact path="/publisher" component={Publisher} />
      <Route exact path="/subscriber" component={Subscriber} /> */}
  </Switch>
);

export default BaseRouter;
