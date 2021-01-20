import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Header from "./components/Home/Header";
import IncomeCard from "./components/Home/IncomeCard";
import { Route, Switch } from "react-router-dom";
import DashboardHome from "./containers/DashboardHome";
import SideDrawer from "./components/SideDrawer";
import NotFound from "../../containers/NotFound";

export default function Landing() {
  return (
    <SideDrawer>
      <Switch>
        <Route path="/dashboard/" exact component={DashboardHome} />
        <Route component={NotFound} />
      </Switch>
    </SideDrawer>
  );
}
