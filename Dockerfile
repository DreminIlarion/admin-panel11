FROM node:23.6

WORKDIR /frontend.admin

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000
 
CMD [ "npm","start" ]