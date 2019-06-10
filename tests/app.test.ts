import * as amqplib from 'amqplib';
import { expect } from 'chai';
import * as sinon from 'sinon';
import AMQP, { exchangeTypes } from '../src/app';

describe('AMQP', () => {
  let amqpConnectStub: any;
  let amqpChannelStub: any;
  let amqp: AMQP;

  beforeEach(() => {
    amqp = new AMQP('user', 'password', 'host', 'vhost', 5672);
    amqpConnectStub = sinon.stub(amqplib, 'connect');
    amqpChannelStub = {
      assertExchange: sinon.stub().resolves(),
      publish: sinon.spy(),
    };
    amqpConnectStub.resolves({
      createChannel: sinon.stub().resolves(amqpChannelStub),
    });

  });

  afterEach(() => {
    amqpConnectStub.restore();
  });

  context('createChannel', () => {
    it('should call amqplib connect method with correct string', async () => {
      const expectedUrl = 'amqp://user:password@host:5672/vhost';
      await amqp.createChannel();

      expect(amqpConnectStub.withArgs(expectedUrl).calledOnce).to.be.equal(true);
    });

    it('should reject if amqplib connect throws an error', () => {
      amqpConnectStub.rejects(new Error('connect-error'));

      amqp.createChannel()
        .then(() => expect.fail('amqplib connect should reject'))
        .catch((err) => expect(err).to.be.instanceOf(Error));
    });

    it('should reject if amqplib channel createChannel throws an error', () => {
      amqpConnectStub.resolves({
        createChannel: sinon.stub().rejects(new Error('channel-error')),
      });

      amqp.createChannel()
        .then(() => expect.fail('amqplib createChannel should reject'))
        .catch((err) => expect(err).to.be.instanceOf(Error));
    });

    it('should resolve with amqplib channel if channel is succesfully created', () => {
      amqp.createChannel()
        .then((channel) => expect(channel).to.not.be.undefined)
        .catch(() => expect.fail('amqplib createChannel should resolve'));
    });

    it('should create only one connection in case of creating more than one channel', async () => {
      await amqp.createChannel();
      await amqp.createChannel();

      expect(amqpConnectStub.calledOnce).to.be.equal(true);
    });
  });

  context('createPublisher', () => {
    let exchange: string;
    let type: exchangeTypes;

    beforeEach(() => {
      exchange = 'exchange';
      type = exchangeTypes.topic;
    });

    it('should reject if amqplib createChannel throws an error', () => {
      amqpConnectStub.resolves({
        createChannel: sinon.stub().rejects(new Error('channel-error')),
      });

      amqp.createPublisher(exchange, type)
        .then(() => expect.fail('amqplib createChannel should reject'))
        .catch((err) => expect(err).to.be.instanceOf(Error));
    });

    it('should reject if channel assertExchange throws an error', () => {
      amqpChannelStub.assertExchange.rejects(new Error('assert-error'));

      amqp.createPublisher(exchange, type)
        .then(() => expect.fail('amqplib assertExchange should reject'))
        .catch((err) => expect(err).to.be.instanceOf(Error));
    });

    it('should call channel assertExchange with correct arguments', async () => {
      await amqp.createPublisher(exchange, type);

      expect(amqpChannelStub.assertExchange.withArgs(exchange, type).calledOnce).to.be.equal(true);
    });

    it('should resolve with a function', () => {
      amqp.createPublisher(exchange, type)
        .then((publish) => expect(publish).to.be.a('function'))
        .catch(() => expect.fail('amqplib assertExchange should resolve'));
    });

    it('should call channel publish with correct arguments', async () => {
      const binding = 'bind';
      const message = 'message';

      try {
        const publish = await amqp.createPublisher(exchange, type);

        publish(binding, message);
        publish(binding, { message });

        expect(amqpChannelStub.publish.withArgs(
          exchange, binding, Buffer.from(message),
        ).calledOnce).to.be.equal(true);

        expect(amqpChannelStub.publish.withArgs(
          exchange, binding, Buffer.from(JSON.stringify({ message })),
        ).calledOnce).to.be.equal(true);
      } catch ({}) {
        expect.fail('amqplib assertExchange should resolve');
      }
    });
  });
});
