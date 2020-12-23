import React, { useEffect } from "react";
import { accountVar, contractIDVar } from "./cache";
import { useLazyQuery, useReactiveVar } from "@apollo/client";

export function useQueryWithAccount(QUERY) {
  let account = useReactiveVar(accountVar);




  let [sendQuery, { loading, error, data }] = useLazyQuery(QUERY);

  useEffect(() => {
    if (account) {
      sendQuery({ variables: { id: account } });
    }
  }, [account]);

  if (error) {
    console.log(error);
  }

  return { loading, error, data };
}

export function useQueryWithAccountNetwork(QUERY) {
  let account = useReactiveVar(accountVar);

  let [sendQuery, { loading, error, data }] = useLazyQuery(QUERY, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (account) {
      sendQuery({ variables: { id: account } });
    }
  }, [account]);

  if (error) {
    console.log(error);
  }

  return { loading, error, data };
}

// export function useQueryWithContract(QUERY) {
//   let contractID = useReactiveVar(contractIDVar);
//   let [sendQuery, {loading, error, data, refetch}] = useLazyQuery(QUERY, {
//     fetchPolicy: "cache-only",
//   });

//   useEffect(() => {
//     if (contractID) {
//       sendQuery({variables: {id: contractID}});
//     }
//   }, [contractID]);

//   if (error) {
//     console.log(error);
//   }

//   return {loading, error, data, refetch};
// }
