import { forwardRef, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [forwardRef(() => MessageModule)],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
