import { useReactiveVar } from "@apollo/client";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { ethers } from "ethers";
import moment from "moment";
import React, { useEffect } from "react";
import { accountVar } from "../../../../cache";
import { useQueryWithAccountNetwork } from "../../../../hooks";
import { GET_TRANSACTIONS_TO } from "../../queries";

const useStyles = makeStyles((theme) => ({
  pos: {
    color: "#00b300",
  },
  neg: {
    color: "#e60000",
  },
}));

export default function Transactions() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  let { data } = useQueryWithAccountNetwork(GET_TRANSACTIONS_TO);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const mintChip = () => {
    return <Chip label="Mint" style={{ backgroundColor: "#cfffe5" }} />;
  };

  const incomeChip = () => {
    return <Chip label="Income" style={{ backgroundColor: "#66ff66" }} />;
  };

  const paymentChip = () => {
    return <Chip label="Payment" style={{ backgroundColor: "#ff6666" }} />;
  };

  const positiveAmt = (amount) => {
    return <Typography className={classes.pos}>+ {amount}</Typography>;
  };

  const negativeAmt = (amount) => {
    return <Typography className={classes.neg}>- {amount}</Typography>;
  };

  return (
    <Card>
      <CardHeader title="Recent Transactions" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.userTransactionsTo?.slice(0, 7).map((row, index) => (
              <TableRow>
                <TableCell compoent="th" scope="row">
                  {row.from
                    ? row.to === account
                      ? incomeChip()
                      : paymentChip()
                    : mintChip()}
                </TableCell>
                <TableCell>
                  {row.from === null || row.to === account
                    ? positiveAmt(ethers.utils.formatEther(row.amount))
                    : negativeAmt(ethers.utils.formatEther(row.amount))}
                </TableCell>
                <TableCell>{moment.unix(row.timestamp).format()}</TableCell>
                <TableCell>
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://rinkeby.etherscan.io/tx/${row.id}`}
                  >
                    View on Etherscan {">"}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
