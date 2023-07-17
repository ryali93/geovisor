FROM node:16 as build
ARG WORK_DIR=/backend
ENV PATH ${WORK_DIR}/node_modules/.bin:$PATH

RUN mkdir ${WORK_DIR}
WORKDIR ${WORK_DIR}

COPY package*.json ${WORK_DIR}

RUN npm install

COPY . ${WORK_DIR}

EXPOSE 3000
