import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { UpdateDependencyDto } from './dto/update-dependency.dto';
import { Dependency } from './entities/dependency.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DependenciesService {
  constructor(
    @InjectModel(Dependency.name) private DependencyModel: Model<Dependency>,
  ) {}

  create(createDependencyDto: CreateDependencyDto) {
    try {
      if (!createDependencyDto.name || !createDependencyDto.project_id) {
        throw new BadRequestException('Error projectID and name is required ');
      }
      const createdDependency = new this.DependencyModel(createDependencyDto);
      return createdDependency.save();
    } catch (error) {
      throw new InternalServerErrorException('Error fail create dependency');
    }
  }

  findAll() {
    try {
      const result = this.DependencyModel.find();
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error fail fetching dependency');
    }
  }

  findOne(id: string) {
    try {
      const result = this.DependencyModel.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fail fetching by ID dependency',
      );
    }
  }

  update(id: string, updateDependencyDto: UpdateDependencyDto) {
    if (!id || !updateDependencyDto) {
      throw new BadRequestException('Error Id and data is required');
    }

    const existDependency = this.DependencyModel.findById(id);

    if (!existDependency) {
      throw new NotFoundException('Error not found dependency');
    }

    try {
      const updatedDependency = this.DependencyModel.findByIdAndUpdate(
        id,
        updateDependencyDto,
        { new: true },
      );

      if (!updatedDependency) throw new Error('Error update dependency');

      return updatedDependency;
    } catch (error) {
      throw new InternalServerErrorException('Error update dependency');
    }
  }

  remove(id: string) {
    if (!id) {
      throw new BadRequestException('Error ID is required');
    }

    try {
      const deletedDependency = this.DependencyModel.deleteOne({ _id: id });
      if (!deletedDependency) {
        throw new Error('Error for deleting dependency');
      }
      return deletedDependency;
    } catch (error) {
      throw new InternalServerErrorException('Error update dependency');
    }
  }
}
