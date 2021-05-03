const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const amqp = require('amqplib');
const assert = require('assert');
const logger = require('../utils/logger');

const serviceName = process.env.SERVICENAME;
const cosumesFromExchange = process.env.CONSUMESFROMEXCHANGE;
const intents = require('./intents');

const queueName = `${serviceName}Queue`;
const exchangeName = `${serviceName}Exchange`;

// parse the intents defined by the user
let supportedIntents;
try {
  supportedIntents = Object.keys(intents).map((e) => {
    const intentLegalNameRegex = /.*_v[0-9]+_[0-9]+_[0-9]+$/;

    assert(intentLegalNameRegex.test(e));
    return { intent: e.split('_v')[0], intentVersion: e.split('_v')[1] };
  });
} catch (error) {
  throw new Error('can not parse supported intents and their versions, please follow the naming rule: intentName_v2_1_10 or... ');
}

console.log(serviceName, supportedIntents);

const main = async () => {
  const connection = await amqp.connect(process.env.AMQP_URL);
  const channel = await connection.createChannel();

  // create queue that this service will receive it's works
  await channel.assertQueue(queueName, { durable: true });

  await Promise.all(supportedIntents.map((supportedIntent) => channel.bindQueue(queueName, cosumesFromExchange, `${serviceName}-${supportedIntent.intent}-v${supportedIntent.intentVersion}`)));
  // await channel.bindQueue(queueName, 'apiExchange', 'addDate');

  // create exchnage that this worker will publish it's done works
  await channel.assertExchange(exchangeName, 'direct', { durable: true });

  // consume from it's queue
  await channel.prefetch(1);
  channel.consume(queueName, async (msg) => {
    const msgBody = JSON.parse(msg.content.toString());
    const { service, intent, intentVersion, requestData, taskId } = msgBody;
    try {

      console.log(msgBody);
      // do the intent
      // TODO: check if this service supports requests intent and version
      intents[`${intent}_${intentVersion}`](msgBody);

      console.log(intent, msgBody);

      await channel.publish(exchangeName, `${intent}Done`, Buffer.from(JSON.stringify(msgBody), 'utf-8'));

      await channel.ack(msg);
    } catch (error) {
      error.requestData = requestData;
      error.intent = intent;
      error.taskId = taskId;
      logger.error(error);
    }
  });
};

(async () => {
  try { await main(); } catch (error) { logger.error(error); }
})();
