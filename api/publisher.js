class Publisher {
  constructor(channel, toExchange) {
    this.channel = channel;
    this.toExchange = toExchange;
  }

  publish({ service, intent, intentVersion, requestData, taskId }) {
    const routingKey = `${service}-${intent}-${intentVersion}`;
    console.log(routingKey);
    return this.channel.publish(this.toExchange, routingKey, Buffer.from(JSON.stringify({ service, intent, intentVersion, requestData, taskId }), 'utf-8'));
  }
}

module.exports = Publisher;
