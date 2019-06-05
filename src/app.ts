import * as amqplib from 'amqplib';

export const connect = (url: string): Promise<amqplib.Channel> => new Promise((resolve, reject) => {
  amqplib
    .connect(url)
    .then((connection: amqplib.Connection) => {

      connection
        .createChannel()
        .then((channel: amqplib.Channel) => resolve(channel))
        .catch((err: Error) => reject(err));
    })
    .catch((err: Error) => reject(err));
});

class AMQP {
  private readonly url: string;

  constructor(
    user: string,
    password: string,
    host: string,
    vhost: string,
    port: number = 5672,
  ) {
    this.url = `amqp://${user}:${password}@${host}:${port}/${vhost}`;
  }
}

export default AMQP;
