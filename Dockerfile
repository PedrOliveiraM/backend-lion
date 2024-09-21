FROM node:18-alpine
WORKDIR /backend-lion
COPY . . 
RUN npm install --pro


