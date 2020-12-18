import React from "react";
import { Route, Switch } from "react-router-dom";

import Dashboard from "./pages/Landing";
// import Creator from "./pages/Creator";
import Subscriber from "./pages/Subscriber";

const BaseRouter = () => (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    {/* <Route exact path="/creator" component={Creator} /> */}
    <Route path="/:creatorID" component={Subscriber} />
  </Switch>
);

export default BaseRouter;
