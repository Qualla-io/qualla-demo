FROM node:10

WORKDIR /user/src/LocalData

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4005

CMD npm run dev