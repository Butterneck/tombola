FROM node:15.5-alpine
RUN adduser --disabled-password app
WORKDIR /app
COPY ./package.json package.json
RUN npm install

COPY ./src /app/src
COPY ./config.json /app/config.json
COPY ./ecosystem.config.js /app/ecosystem.config.js
COPY ./public /app/public
RUN chown -R app:app /app

USER app
ENTRYPOINT [ "npm" ]
CMD ["start"]
