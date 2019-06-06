import * as amqplib from 'amqplib';

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
          .catch((err: Error) => reject(err));
      })
      .catch((err: Error) => reject(err));
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
      .catch((err: Error) => reject(err));
    });
  }
}

export default AMQP;
