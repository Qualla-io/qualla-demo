import React from "react";

import { Route, Switch } from "react-router-dom";
import DashboardHome from "./containers/DashboardHome";
import SideDrawer from "./components/SideDrawer";
import NotFound from "../../containers/NotFound";
import TopBar from "./components/TopBar";

export default function Landing() {
  return (
    <>
      <SideDrawer>
        <Switch>
          <Route path="/dashboard/" exact component={DashboardHome} />
          <Route component={NotFound} />
        </Switch>
      </SideDrawer>
    </>
  );
}
