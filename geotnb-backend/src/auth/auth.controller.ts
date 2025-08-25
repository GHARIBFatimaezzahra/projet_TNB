import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { User } from '../user/entities/user.entity';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({ status: 201, description: 'Inscription réussie' })
  @ApiResponse({ status: 409, description: 'Utilisateur déjà existant' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil récupéré' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      profil: user.profil,
      dateCreation: user.dateCreation,
      dernierAcces: user.dernierAcces,
    };
  }

  @Get('admin-test')
  @ApiBearerAuth()
  @Roles('Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Test route admin uniquement' })
  testAdminRoute(@CurrentUser() user: User) {
    return {
      message: 'Accès admin autorisé',
      user: user.username,
      profil: user.profil,
    };
  }

  @Get('fiscal-test')
  @ApiBearerAuth()
  @Roles('Admin', 'AgentFiscal')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Test route admin et agent fiscal' })
  testFiscalRoute(@CurrentUser() user: User) {
    return {
      message: 'Accès fiscal autorisé',
      user: user.username,
      profil: user.profil,
    };
  }
}