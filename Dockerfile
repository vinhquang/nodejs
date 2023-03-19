FROM node:19 as base

# Create app directory
WORKDIR /usr/src/app

RUN yarn global add nodemon

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./
COPY ./yarn.lock ./
RUN yarn

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src .

EXPOSE 3000
CMD [ "node", "index" ]




FROM base as production

RUN npm run build