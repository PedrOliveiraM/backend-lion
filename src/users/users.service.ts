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
import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { ForgetPasswordDto } from './dto/forgetPassword-user-dto';
import { LoginDto } from './dto/login-user-dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.username) {
      throw new BadRequestException('Username is required');
    }
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }
    if (!createUserDto.email) {
      throw new BadRequestException('Email data is required');
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

  async findByEmail(email: string) {
    try {
      if (!email) {
        throw new BadRequestException('email is required !');
      }
      const result = await this.UserModel.findOne({ email }).exec();
      if (!result) {
        throw new NotFoundException('Error not found email in database');
      }
      return result;
    } catch (error) {
      throw new BadRequestException('Error fetching email: ' + error.message);
    }
  }

  async findByUsername(username: string) {
    try {
      if (!username) {
        throw new BadRequestException('Username is required !');
      }
      const result = await this.UserModel.findOne({ username }).exec();
      if (!result) {
        throw new NotFoundException('Error not found username in database');
      }
      return result;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching username: ' + error.message,
      );
    }
  }

  async validateUser(loginDto: LoginDto) {
    if (!loginDto.password) {
      throw new BadRequestException('Error username and password is required');
    }

    try {
      const { username, password } = loginDto;
      const user = await this.findByUsername(username);

      if (user.username !== username) {
        throw new Error('Username is incorrect');
      }
      if (user.password !== password) {
        throw new Error('Username is incorrect');
      }

      return {
        code: 201,
        msg: 'User validation',
        status: true,
        id: user._id,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error username or password is incorrect ' + error.message,
      );
    }
  }

  async sendPasswordResetEmail(forgetPasswordDto: ForgetPasswordDto) {
    const existingEmail = await this.findByEmail(forgetPasswordDto.email);

    if (!existingEmail) {
      throw new NotFoundException('Error fetching email');
    }

    const mailerSend = new MailerSend({
      apiKey: process.env.API_KEY,
    });

    const sentFrom = new Sender(
      'your-email@trial-vywj2lpye9jl7oqz.mlsender.net',
      'LionXproSupport',
    );

    const recipients = [
      new Recipient(existingEmail.email, existingEmail.username),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject('Recuperação de Senha - Sua Nova Senha')
      .setHtml(
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
          <p style="color: #555; font-size: 16px;">
            Olá,
          </p>
          <p style="color: #555; font-size: 16px;">
            Recebemos uma solicitação para redefinir sua senha. Aqui está sua nova senha temporária:
          </p>
          <p style="font-size: 20px; font-weight: bold; text-align: center; color: #333;">
            <span style="background-color: #f2f2f2; padding: 10px 20px; border-radius: 5px;">${existingEmail.password}</span>
          </p>
          <p style="color: #555; font-size: 16px;">
            Por favor, use essa senha para acessar sua conta e, em seguida, altere-a para uma senha de sua escolha por motivos de segurança.
          </p>
          <p style="color: #555; font-size: 16px;">
            Se você não solicitou uma redefinição de senha, por favor, ignore este email.
          </p>
          <p style="color: #555; font-size: 16px;">
            Obrigado,
          </p>
          <p style="color: #555; font-size: 16px;">
            <strong>Equipe de suporte Lion X PRO</strong>
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.seusite.com" style="color: #fff; background-color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visite nosso site</a>
          </div>
        </div>
      `,
      )
      .setText(
        'Olá, Recebemos uma solicitação para redefinir sua senha. Use a nova senha fornecida para acessar sua conta e altere-a para uma nova senha de sua escolha. Obrigado.',
      );

    const result = await mailerSend.email.send(emailParams);
    if (result) {
      return {
        code: 201,
        msg: 'Email for reset password is send',
        status: true,
      };
    }
  }
}
