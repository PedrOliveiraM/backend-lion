import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  create(createUserDto: CreateUserDto) {
    const createdUser = new this.UserModel(createUserDto);
    createdUser.save();
  }

  findAll() {
    return this.UserModel.find();
  }

  findOne(id: string) {
    const user = this.UserModel.findById(id);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const newUser = this.UserModel.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        updateUserDto,
      },
      {
        new: true,
      },
    );
    return newUser.exec();
  }

  remove(id: string) {
    return this.UserModel.deleteOne({ _id: id }).exec();
  }
}
