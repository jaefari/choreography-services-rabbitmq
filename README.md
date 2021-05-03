# Choreography Services, Rabbitmq version

## Cautious
it's just a playground :)

## Description
Implementing Choreography services that are not aware of each other, and finally inform apiService via an Observer on api service

![choreography services communication ](https://raw.githubusercontent.com/jaefari/choreography-services-rabbitmq/main/img/services.jpeg)


## Installation
first config .env of each service and set rabbitmq url and sentry url, then:
```bash
npm i
```
Because of the loop usage of exchanges depicted in above picture, the apiExchange must be created manually via script
```bash
node api/createApiExchange.js
```

## Usage
```
// first run services

node service-date
node service-information
node service-security

// now run api
node api
```

## Creating a new Service
just copy one of the services folders like dateService and only take care of intents.js and define your intents, this file will be parsed to create anything that is needed

```javascript
module.exports.addDate_v1_0_0 = (msg) => {
  msg.date = new Date();
  return msg;
};

module.exports.addWeekDay_v1_0_1 = (msg) => {
  msg.weekDay = new Date().getDay();
  return msg;
};
```


## Sample intents
```bash
GET http://localhost:3000/date/addDate/v1_0_0
GET http://localhost:3000/information/backgroundCheck/v1_0_0
```