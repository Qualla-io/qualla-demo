# qualla-demo

Subscription and digital good marketplace for creators

To reset chain and database:

1. Stop graph-node, ipfs, postgres
2. In ./ run "node resetDB.js" (have to ctrl+c to get out of it)
3. In run "rm -Recurse -Force graph-node/data/"
4. In ./: "npx hardhat node --hostname 0.0.0.0"
5. In ./: "npx hardhat run scripts/deploy.js --network localhost"
6. In ./ run "docker-compose -f graphnode-docker.yml up --build -d" (wait for graph-node to boot)
6. In ./subgraphs: "yarn codegen" && "yarn prepare:local" && "yarn create-local" && "yarn deploy-local"
7. In ./ run "docker-compose -f docker-compose.yml up --build -d"

Kubernetes Dashboard:

- kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml
- kubectl proxy --port=8005
- http://localhost:8005/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

- list context: kubectl config get-contexts
- change context: kubectl config use-context docker-desktop

Push Docker Images

- in the folder with Dockerfile:

1. docker build -t qualla/blockchain-basetoken:latest .
2. docker push qualla/blockchain-basetoken

Base64 encode:
echo -n "string" | base64
