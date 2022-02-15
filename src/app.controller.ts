import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('record')
  getRecords() {
    return this.appService.findAll();
  }

  @Post()
  postRecord() {
    return this.appService.create({
      filename: 'Hello world',
      tag: '',
      major_drive: 'Drive',
      minor_drive: 'hello@gmail.com',
      path: '/hellowowo/sososo',
    });
  }
}
