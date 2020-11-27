# qualla-demo

Subscription and digital good marketplace for creators

To reset chain and database:

1. Stop truffle, graph node, apollo server
2. In ./backend run "node resetDB.js"
3. In graph-node/docker run "docker-compose down -v" && "rm -Recurse -Force data/"
4. In ./ run "truffle develop" && "migrate"
5. In graph-node/docker run "docker-compose up"
6. In ./subgraphs run "yarn codegen" && "yarn create-local" && "yarn deploy-local"
7. In ./server run "npm run dev"