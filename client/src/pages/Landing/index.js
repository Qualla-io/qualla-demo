import React from "react";

import { Container } from "@material-ui/core";

import Header from "./containers/Header";
import SubTokens from "./containers/SubTokens";
import SubbedTo from "./containers/SubbedTo";

export default function Landing() {
  return (
    <Container>
      <Header />
      <SubTokens />
      <SubbedTo />
    </Container>
  );
}
