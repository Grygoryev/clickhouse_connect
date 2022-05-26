FROM node:14
COPY ./ /opt/app/
EXPOSE 3000

VOLUME /opt/app/
WORKDIR /opt/app/
RUN npm install
CMD npm start