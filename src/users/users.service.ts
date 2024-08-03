import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto) {
      throw new BadRequestException('User data is required');
    }

    const { email, username } = createUserDto;

    const existingUser = await this.UserModel.findOne({
      $or: [{ email }, { username }],
    }).exec();
    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    try {
      const createdUser = new this.UserModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      throw new BadRequestException('Error creating user: ' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.UserModel.find().exec();
    } catch (error) {
      throw new BadRequestException('Error fetching users: ' + error.message);
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    try {
      const user = await this.UserModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new BadRequestException('Error fetching user: ' + error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id || !updateUserDto) {
      throw new BadRequestException('User ID and update data are required');
    }
    try {
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      ).exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    try {
      const result = await this.UserModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException('Error deleting user: ' + error.message);
    }
  }
}
