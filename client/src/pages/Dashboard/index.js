import React from "react";

import { Route, Switch } from "react-router-dom";
import DashboardHome from "./containers/DashboardHome";
import SideDrawer from "./components/SideDrawer";
import NotFound from "../../containers/NotFound";
import Profile from "./containers/Profile";
import TierTokens from "./containers/TierTokens";

export default function Landing() {
  return (
    <>
      <SideDrawer>
        <Switch>
          <Route path="/dashboard/" exact component={DashboardHome} />
          <Route path="/dashboard/profile" exact component={Profile} />
          <Route path="/dashboard/tiers" exact component={TierTokens} />
          <Route component={NotFound} />
        </Switch>
      </SideDrawer>
    </>
  );
}
