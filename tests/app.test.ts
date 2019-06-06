import * as amqplib from 'amqplib';
import { expect } from 'chai';
import * as sinon from 'sinon';
import AMQP from '../src/app';

describe('AMQP', () => {
  let amqpConnectStub: any;
  let amqpChannelStub: sinon.SinonStub;
  let amqp: AMQP;

  beforeEach(() => {
    amqp = new AMQP('user', 'password', 'host', 'vhost', 5672);
    amqpConnectStub = sinon.stub(amqplib, 'connect');
    amqpChannelStub = sinon.stub();
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
});
