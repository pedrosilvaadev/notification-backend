import { forwardRef, Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [forwardRef(() => RabbitMQModule)],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService],
  exports: [MessageGateway],
})
export class MessageModule {}
