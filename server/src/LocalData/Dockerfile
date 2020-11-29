FROM node:10

WORKDIR /user/src/LocalData

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4004

CMD sleep 10 && npm run dev