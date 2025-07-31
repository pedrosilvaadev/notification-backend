import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import type { Response } from 'express';
import { MessageService } from './message.service';

@Controller('api/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() body: CreateMessageDto, @Res() res: Response) {
    await this.messageService.sendMessage(body.messageId, body.messageContent);

    return res.status(202).json({
      message: 'Notification received. Processing...',
      messageId: body.messageId,
    });
  }

  @Get('status/:id')
  async getMessageStatus(@Param('id') id: string, @Res() res: Response) {
    const status = this.messageService.getMessageStatus(id);

    return res.status(200).json({ messageId: id, status });
  }
}
