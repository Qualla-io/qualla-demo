import React from "react";
import { Route, Switch } from "react-router-dom";

import Landing from "./pages/Landing";
// import Creator from "./pages/Creator";
// import Subscriber from "./pages/Subscriber";

const BaseRouter = () => (
  <Switch>
    <Route exact path="/" component={Landing} />
    {/* <Route exact path="/creator" component={Creator} />
      <Route exact path="/subscriber" component={Subscriber} /> */}
  </Switch>
);

export default BaseRouter;
