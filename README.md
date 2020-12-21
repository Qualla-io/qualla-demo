# qualla-demo

Subscription and digital good marketplace for creators

To reset chain and database:

1. Stop hardhat, graph node, apollo server
2. In ./ run "node resetDB.js"
3. In graph-node/docker run "rm -Recurse -Force data/" && "docker-compose up"
4. In ./: "npx hardhat node --hostname 0.0.0.0"
5. In ./: "npx hardhat run scripts/init-deploy.js --network localhost"
6. In ./subgraphs: "yarn codegen" && "yarn create-local" && "yarn deploy-local"
7. In ./ run "docker-compose up --build -d"
