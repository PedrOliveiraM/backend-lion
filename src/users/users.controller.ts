import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user-dto';
import { ForgetPasswordDto } from './dto/forgetPassword-user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  // Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto) {
      throw new BadRequestException('Invalid username or password');
    }
    const user = await this.usersService.validateUser(loginDto);
    return user;
  }

  // Forget Password
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    const user = await this.usersService.findByEmail(forgetPasswordDto.email);
    if (!user) {
      throw new BadRequestException('Email not found');
    }
    return this.usersService.sendPasswordResetEmail(user);
  }
}
