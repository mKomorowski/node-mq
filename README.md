[![Build Status](https://travis-ci.org/mKomorowski/node-mq.svg?branch=master)](https://travis-ci.org/mKomorowski/node-mq)

# node-mq
AMQP wrapper for node based on amqp-lib package

Library is using RabbitMQ 0.9.1 driver

### Installation

### Usage

```javascript
const AMQP = require('amqp');

const amqp = new AQMP(
  'user', 'password', 'host', 'vhost',
)
```