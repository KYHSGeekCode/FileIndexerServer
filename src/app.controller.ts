import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RecordDocument } from './documents/record.document';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('record')
  getRecordsByName(
    @Query('query') query: string,
    @Query('cursor') cursor: string,
  ) {
    return this.appService.findByNameContaining(query, cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Post('record')
  postRecord(@Body() body: RecordDocument) {
    return this.appService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('records')
  postRecords(@Body() body: RecordDocument[]) {
    Logger.log(body);
    return this.appService.bulk_create(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
