import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { AdminOnly, AgentFiscalOrAdmin } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Utilisateur déjà existant' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des utilisateurs avec pagination et recherche' })
  findAll(@Query() searchParams: SearchUserDto) {
    return this.userService.findAll(searchParams);
  }

  @Get('statistics')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des utilisateurs' })
  getStatistics() {
    return this.userService.getStatistics();
  }

  @Get('inactive')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Utilisateurs inactifs' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getInactiveUsers(@Query('days') days?: number) {
    return this.userService.findInactiveUsers(days);
  }

  @Get('by-role/:role')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Utilisateurs par rôle' })
  getUsersByRole(@Param('role') role: string) {
    return this.userService.getUsersByRole(role);
  }

  @Get(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur modifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Changer son mot de passe' })
  changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, changePasswordDto);
  }

  @Delete(':id')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Patch(':id/activate')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Activer un utilisateur' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.userService.activate(id);
  }

  @Patch(':id/deactivate')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deactivate(id);
  }
}