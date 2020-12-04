const {gql} = require("apollo-server");
const {executeGraphql} = require("federation-testing-tool");

const td = require("testdouble");
require("testdouble-jest")(td, jest);

const {getContracts} = td.replace("./contractData");

const {typeDefs} = require("./typeDefs");
const {resolvers} = require("./resolvers");

const service = {typeDefs, resolvers};

describe("the contracts", () => {
  const query = gql`
    {
      contracts {
        id
      }
    }
  `;

  it("should be calculated with estimateShipping based on the price and weight", async () => {
    
    // td.when(getContracts()).thenReturn([
    //   {
    //     id: "test",
    //   },
    //   {
    //     id: "test3",
    //   },
    // ]);


    console.log(service);

    const result = await executeGraphql({
      query,
      service
    });

    console.log(result);

  });
});
