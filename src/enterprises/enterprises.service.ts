import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Enterprise } from './entities/enterprise.entity';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectModel(Enterprise.name) private EnterpriseModel: Model<Enterprise>,
  ) {}

  async create(createEnterpriseDto: CreateEnterpriseDto) {
    if (!createEnterpriseDto) {
      throw new BadRequestException('Enterprise data is required');
    }
    const { name, region, userId } = createEnterpriseDto;

    const existingEnterprise = await this.EnterpriseModel.findOne({
      $or: [{ name }, { region }],
      $and: [{ userId }],
    }).exec();
    if (existingEnterprise) {
      throw new ConflictException('name or region already exists');
    }
    try {
      const createdEnterprise = new this.EnterpriseModel(createEnterpriseDto);
      return await createdEnterprise.save();
    } catch (error) {
      throw new BadRequestException('Error creating user: ' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.EnterpriseModel.find().exec();
    } catch (error) {
      throw new BadRequestException(
        'Error fetching enterprises: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Enterprise Id is required');
    }
    try {
      const enterprise = await this.EnterpriseModel.findById(id).exec();
      return enterprise;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching enterprise: ' + error.message,
      );
    }
  }

  async findAllByUserId(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const user = await this.EnterpriseModel.find({
        userID: id,
      }).exec();

      if (!user || user.length === 0) {
        throw new NotFoundException(
          'No user found with the provided dependency_id',
        );
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding enterprises by user id: ' + error.message,
      );
    }
  }

  async update(id: string, updateEnterpriseDto: UpdateEnterpriseDto) {
    if (!id || !updateEnterpriseDto)
      throw new BadRequestException(
        'Enterprise ID and update data are required',
      );

    try {
      const updatedEnterprise = await this.EnterpriseModel.findByIdAndUpdate(
        id,
        updateEnterpriseDto,
        { new: true },
      ).exec();
      if (!updatedEnterprise)
        throw new NotFoundException(`Enterprise with ID ${id} not found`);
      return updatedEnterprise;
    } catch (error) {
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  async remove(id: string) {
    if (!id) throw new BadRequestException('Enterprise ID is required');
    try {
      const result = await this.EnterpriseModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Enterprise with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException('Error deleting user: ' + error.message);
    }
  }
}
