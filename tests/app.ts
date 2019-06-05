import * as amqplib from 'amqplib';
import * as sinon from 'sinon';
import AMQP from '../src/app';

describe('AMQP', () => {
  const user = 'user';
  const password = 'password';
  const host = 'host';
  const vhost = 'vhost';
  const port = 5672;
  let amqpConnectionStub: sinon.SinonStub;
  let amqp: AMQP;

  beforeEach(() => {
    amqp = new AMQP(user, password, host, vhost, port);
    amqpConnectionStub = sinon.stub(amqplib, 'connect');
  });

  afterEach(() => {
    amqpConnectionStub.restore();
  });

  context('connect', () => {
    it('should call amqplib connect with correct string', () => {});
    it('should reject if amqplib connect throws an error', () => {});
    it('should reject if amqplib channel createChannel throws an error', () => {});
    it('should resolve with amqplib channel if channel is succesfully created', () => {});
  });
});
