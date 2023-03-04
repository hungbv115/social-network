FROM node:16

WORKDIR /home/server

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

EXPOSE 8081

CMD [ "yarn", "start" ]