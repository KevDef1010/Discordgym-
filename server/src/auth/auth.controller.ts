import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('exists')
  async checkUserExists(
    @Query('email') email: string,
    @Query('username') username: string,
    @Query('discordId') discordId: string,
  ) {
    return await this.authService.checkUserExists(email, username, discordId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-account')
  async deleteAccount(@Request() req: any) {
    return await this.authService.deleteAccount(req.user.id as string);
  }
}
