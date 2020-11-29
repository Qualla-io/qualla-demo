FROM node:10

WORKDIR /user/src/gateway

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4000

CMD sleep 12 && npm run dev