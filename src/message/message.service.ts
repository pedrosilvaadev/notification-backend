import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class MessageService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async sendMessage(messageId: string, content: string) {
    await this.rabbitMQService.publishToQueue(messageId, content);
  }

  getMessageStatus(messageId: string): string | undefined {
    return this.rabbitMQService.getStatus(messageId);
  }
}
