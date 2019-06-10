import * as amqplib from 'amqplib';

export type Publisher = (binding: string, message: string | object) => void;
export enum exchangeTypes {
  direct = 'direct',
  fanout = 'fanout',
  topic = 'topic',
}

class AMQP {
  private readonly url: string;
  private connection: amqplib.Connection | undefined;

  constructor(
    user: string,
    password: string,
    host: string,
    vhost: string,
    port: number = 5672,
  ) {
    this.url = `amqp://${user}:${password}@${host}:${port}/${vhost}`;
  }

  public createChannel(): Promise<amqplib.Channel> {
    return new Promise((resolve, reject) => {
      this
      .createConnection()
      .then((connection: amqplib.Connection) => {

        connection
          .createChannel()
          .then((channel: amqplib.Channel) => resolve(channel))
          .catch(reject);
      })
      .catch(reject);
    });
  }

  public createPublisher(exchange: string, type: exchangeTypes): Promise<Publisher> {
    return new Promise((resolve, reject) => {
      this.createChannel()
        .then((channel: amqplib.Channel) => {
          channel
            .assertExchange(exchange, type)
            .then(() => {
              const publisher: Publisher = (key, message) => {
                const messageString = typeof message === 'string' ? message : JSON.stringify(message);

                channel.publish(exchange, key, Buffer.from(messageString));
              };

              resolve(publisher);
            })
            .catch(reject);
      }).catch(reject);
    });
  }

  private createConnection(): Promise<amqplib.Connection> {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }

    return new Promise((resolve, reject) => {
      amqplib
      .connect(this.url)
      .then((connection: amqplib.Connection) => {
        this.connection = connection;

        resolve(this.connection);
      })
      .catch(reject);
    });
  }
}

export default AMQP;
