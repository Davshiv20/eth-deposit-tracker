FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# Your app binds to port 9101 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 9101

CMD [ "node", "index.js" ]