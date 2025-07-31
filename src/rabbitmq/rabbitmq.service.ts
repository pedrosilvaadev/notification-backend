import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, connect, ChannelModel } from 'amqplib';
import { MessageGateway } from '../message/message.gateway';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: ChannelModel;
  private channel: Channel;

  private readonly statusMap = new Map<string, string>();

  private inputQueue: string;
  private statusQueue: string;
  private rabbitUrl: string;

  constructor(
    private configService: ConfigService,
    private messageGateway: MessageGateway,
  ) {
    this.rabbitUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');
    this.inputQueue = this.configService.getOrThrow<string>('INPUT_QUEUE');
    this.statusQueue = this.configService.getOrThrow<string>('STATUS_QUEUE');
  }

  async onModuleInit() {
    this.connection = await connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.inputQueue);
    await this.channel.assertQueue(this.statusQueue);

    await this.channel.prefetch(1);

    this.consumeMessages();
  }

  async publishToQueue(messageId: string, content: string) {
    const payload = JSON.stringify({ messageId, content });
    this.channel.sendToQueue(this.inputQueue, Buffer.from(payload));
  }

  private async consumeMessages() {
    this.channel.consume(this.inputQueue, async (msg) => {
      if (msg) {
        const { messageId } = JSON.parse(msg.content.toString());

        await new Promise((res) =>
          setTimeout(res, 1000 + Math.random() * 1000),
        );

        const success = Math.floor(Math.random() * 10) > 2;
        const status = success ? 'PROCESSADO_SUCESSO' : 'FALHA_PROCESSAMENTO';

        this.statusMap.set(messageId, status);

        const response = JSON.stringify({ messageId, status });
        this.channel.sendToQueue(this.statusQueue, Buffer.from(response));

        this.messageGateway.notifyStatusUpdate(messageId, status);

        this.channel.ack(msg);
      }
    });
  }

  getStatus(messageId: string): string | undefined {
    return this.statusMap.get(messageId);
  }
}
