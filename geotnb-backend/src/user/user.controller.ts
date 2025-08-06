import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Route de test PUBLIQUE (sans authentification)
  @Get('test')
  getTest() {
    return { 
      message: 'Backend connecté !', 
      timestamp: new Date(),
      status: 'success'
    };
  }

  // Routes protégées avec authentification
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  @Roles('Admin')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  @Roles('Admin')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  @Roles('Admin')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.userService.remove(+id);
  }
}
