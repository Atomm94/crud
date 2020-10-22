FROM node:12.18 AS builder
RUN npm config set unsafe-perm true && npm install eslint tslint -g
COPY . /opt/builder/

WORKDIR /opt/builder

RUN npm install

RUN npm run build

EXPOSE 3001

ENTRYPOINT ["npm", "run"]
CMD ["start"]
