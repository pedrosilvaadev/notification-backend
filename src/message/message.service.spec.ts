import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

describe('MessageService', () => {
  let service: MessageService;
  let rabbitMQServiceMock: Partial<RabbitMQService>;

  beforeEach(async () => {
    rabbitMQServiceMock = {
      publishToQueue: jest.fn().mockResolvedValue(undefined),
      getStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: RabbitMQService, useValue: rabbitMQServiceMock },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should call publishToQueue when sendMessage is called', async () => {
    const messageId = '123';
    const content = 'test message';

    await service.sendMessage(messageId, content);

    expect(rabbitMQServiceMock.publishToQueue).toHaveBeenCalledWith(
      messageId,
      content,
    );
  });

  it('should return status from getMessageStatus', () => {
    const messageId = '123';
    const status = 'PROCESSADO_SUCESSO';

    (rabbitMQServiceMock.getStatus as jest.Mock).mockReturnValue(status);

    const result = service.getMessageStatus(messageId);

    expect(result).toBe(status);
    expect(rabbitMQServiceMock.getStatus).toHaveBeenCalledWith(messageId);
  });

  it('should throw an error if publishToQueue fails', async () => {
    const messageId = '123';
    const content = 'test message';

    (rabbitMQServiceMock.publishToQueue as jest.Mock).mockRejectedValue(
      new Error('Failed to publish'),
    );

    await expect(service.sendMessage(messageId, content)).rejects.toThrow(
      'Failed to publish',
    );

    expect(rabbitMQServiceMock.publishToQueue).toHaveBeenCalledWith(
      messageId,
      content,
    );
  });
});
