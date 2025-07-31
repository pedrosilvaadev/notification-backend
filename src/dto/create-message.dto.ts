import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsUUID()
  messageId: string;

  @IsNotEmpty()
  messageContent: string;
}
