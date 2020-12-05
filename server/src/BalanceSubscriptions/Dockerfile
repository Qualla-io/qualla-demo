FROM node:10

WORKDIR /user/src/BalanceSubscriptions

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 5000

CMD ["npm", "run", "dev"]