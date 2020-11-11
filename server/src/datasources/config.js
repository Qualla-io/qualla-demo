import {createApolloFetch} from "apollo-fetch";

const fetch = createApolloFetch({
  uri: "http://127.0.0.1:8000/subgraphs/name/ghardin1314/qualla-demoV1",
});

export default fetch