/**
 * Authentication Controller
 *
 * REST API endpoints for user authentication operations including registration,
 * login, user existence checking, and account deletion.
 *
 * Endpoints:
 * - POST /auth/register - User registration with validation
 * - POST /auth/login - User authentication and JWT token generation
 * - GET /auth/exists - Check if user exists by email/username/discordId
 * - DELETE /auth/delete-account - Secure account deletion (requires authentication)
 *
 * Security:
 * - JWT authentication required for account deletion
 * - Input validation through DTOs
 * - Password hashing and secure token generation
 *
 * @author DiscordGym Team
 */
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
  /**
   * Constructor - Initialize auth controller
   * @param authService - Authentication service for business logic
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * @param registerDto - Registration data including username, email, password
   * @returns Authentication response with user data and JWT token
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Authenticate user login
   * @param loginDto - Login credentials (email and password)
   * @returns Authentication response with user data and JWT token
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Check if user exists with given identifiers
   * @param email - Email address to check
   * @param username - Username to check
   * @param discordId - Optional Discord ID to check
   * @returns Object indicating existence and specific conflicts
   */
  @Get('exists')
  async checkUserExists(
    @Query('email') email: string,
    @Query('username') username: string,
    @Query('discordId') discordId: string,
  ) {
    return await this.authService.checkUserExists(email, username, discordId);
  }

  /**
   * Delete authenticated user's account
   * Requires JWT authentication for security
   * @param req - Request object containing authenticated user data
   * @returns Confirmation message and deleted user information
   */
  @UseGuards(JwtAuthGuard)
  @Delete('delete-account')
  async deleteAccount(@Request() req: { user: { id: string } }) {
    return await this.authService.deleteAccount(req.user.id);
  }
}
