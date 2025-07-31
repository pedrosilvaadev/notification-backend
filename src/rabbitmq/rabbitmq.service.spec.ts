import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { MessageGateway } from '../message/message.gateway';
('');

jest.mock('amqplib');

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let channelMock: any;

  beforeEach(async () => {
    channelMock = {
      sendToQueue: jest.fn(),
      assertQueue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const env = {
                RABBITMQ_URL: 'amqp://test-url',
                INPUT_QUEUE: 'queue.notification.input.pedro-silva',
                STATUS_QUEUE: 'queue.notification.status.pedro-silva',
              };
              return env[key];
            },
          },
        },
        {
          provide: MessageGateway,
          useValue: { notifyStatusUpdate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    (service as any).channel = channelMock;
  });

  it('should send message to queue', async () => {
    await service.publishToQueue('123', 'mensagem teste');

    expect(channelMock.sendToQueue).toHaveBeenCalledWith(
      'queue.notification.input.pedro-silva',
      Buffer.from(
        JSON.stringify({ messageId: '123', content: 'mensagem teste' }),
      ),
    );
  });

  it('should handle error when sendToQueue throws', async () => {
    channelMock.sendToQueue.mockImplementation(() => {
      throw new Error('Erro ao enviar para fila');
    });

    await expect(
      service.publishToQueue('123', 'mensagem teste'),
    ).rejects.toThrow('Erro ao enviar para fila');

    expect(channelMock.sendToQueue).toHaveBeenCalledTimes(1);
  });
});
