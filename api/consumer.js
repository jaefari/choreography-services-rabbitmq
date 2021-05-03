const queueName = 'responseQueue';

module.exports = async (channel, emitter) => {
  await channel.prefetch(1);
  await channel.assertQueue(queueName, { durable: true });

  // service-date
  await channel.bindQueue(queueName, 'dateExchange', 'addDateDone');
  await channel.bindQueue(queueName, 'dateExchange', 'addWeekDayDone');

  // service-information
  await channel.bindQueue(queueName, 'informationExchange', 'backgroundCheckDone');

  channel.consume(queueName, async (msg) => {
    const msgBody = JSON.parse(msg.content.toString());
    console.log('received: ', msgBody);
    emitter.emit(msgBody.taskId, msgBody);

    await channel.ack(msg);
  });
};
