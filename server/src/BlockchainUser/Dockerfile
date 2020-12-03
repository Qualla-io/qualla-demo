FROM node:10

WORKDIR /user/src/BlockchainUser

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4001

CMD ["npm", "run", "dev"]