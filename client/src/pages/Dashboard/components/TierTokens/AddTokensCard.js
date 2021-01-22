import { Card, CardContent } from "@material-ui/core";
import React from "react";

export default function AddTokensCard({ setModalOpen }) {
  function handleOpen() {
    setModalOpen(true);
  }

  return (
    <Card onClick={handleOpen} style={{ cursor: "pointer" }}>
      <CardContent>+ Mint New Tier Tokens</CardContent>
    </Card>
  );
}
