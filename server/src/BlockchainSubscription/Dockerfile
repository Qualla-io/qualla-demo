FROM node:10

WORKDIR /user/src/BlockchainSubscription

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4003

CMD ["npm", "run", "dev"]