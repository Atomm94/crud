FROM node:20.10.0-alpine3.18 AS builder
RUN npm install eslint tslint -g
COPY . /opt/builder/

WORKDIR /opt/builder

RUN npm install

RUN npm run build

EXPOSE 3001

ENTRYPOINT ["npm", "run"]
CMD ["start"]
