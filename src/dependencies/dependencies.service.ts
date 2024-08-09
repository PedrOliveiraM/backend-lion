import {
  BadRequestException,
  ConflictException,
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

  async create(createDependencyDto: CreateDependencyDto) {
    try {
      if (!createDependencyDto.name || !createDependencyDto.project_id) {
        throw new BadRequestException('Error projectID and name is required ');
      }

      const { name, project_id } = createDependencyDto;
      const existingDependency = await this.DependencyModel.findOne({
        $and: [{ name }, { project_id }],
      }).exec();

      if (existingDependency) {
        throw new ConflictException('This dependency is existed');
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
  async findAllByProjectId(id: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      const projects = await this.DependencyModel.find({
        project_id: id,
      }).exec();
      if (!projects || projects.length === 0) {
        throw new NotFoundException(`No projects found with project_id ${id}`);
      }
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching components: ' + error.message,
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

  async remove(id: string) {
    if (!id) throw new BadRequestException('Dependency ID is required');
    try {
      const result = await this.DependencyModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Dependency with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException(
        'Error deleting Dependency: ' + error.message,
      );
    }
  }
}
