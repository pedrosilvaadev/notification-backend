import { forwardRef, Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { MessageService } from './message.service';

@Module({
  imports: [forwardRef(() => RabbitMQModule)],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
