import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import moment from "moment";

import { GET_TRANSACTIONS_TO } from "../queries";

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { useQueryWithAccount } from "../../../hooks";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";

export default function IncomeCard() {
  let [dateUnit, setDateUnit] = useState("days");
  let [chartData, setChartData] = useState([]);
  let { data } = useQueryWithAccount(GET_TRANSACTIONS_TO);

  useEffect(() => {
    setChartData([]);
    let _chartData = [];
    for (var i = 0; i < 5; i++) {
      _chartData.push({
        date: moment().startOf(dateUnit).subtract(i, dateUnit).format("MM/DD"),
        timestamp: moment().startOf(dateUnit).subtract(i, dateUnit).unix(),
        value: new BigNumber(0),
      });
    }
    for (var i = 0; i < data?.userTransactionsTo?.length; i++) {
      for (var j = 0; j < _chartData.length; j++) {
        if (data.userTransactionsTo[i].timestamp > _chartData[j].timestamp) {
          _chartData[j].value = _chartData[j].value.plus(
            ethers.utils.formatEther(data.userTransactionsTo[i].amount)
          );
          break;
        }
      }
    }
    setChartData(_chartData.reverse());
  }, [data, dateUnit]);

  let handleChange = (event) => {
    setDateUnit(event.target.value);
  };

  return (
    <Grid component={Card} item>
      <CardHeader
        title="Subscription Income"
        action={
          <FormControl variant="outlined">
            <InputLabel>Unit</InputLabel>
            <Select value={dateUnit} onChange={handleChange} label="Unit">
              <MenuItem value={"days"}>Day</MenuItem>
              <MenuItem value={"months"}>Month</MenuItem>
            </Select>
          </FormControl>
        }
      ></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="col" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} />
            <YAxis axisLine={false} />
            <Area type="monotone" dataKey="value" fill="url(#col)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Grid>
  );
}
