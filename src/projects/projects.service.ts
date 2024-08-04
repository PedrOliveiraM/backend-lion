import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './entities/project.entity';
import { Model } from 'mongoose';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private ProjectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    if (!createProjectDto) {
      throw new BadRequestException('Project data is required');
    }
    const { name, address } = createProjectDto;
    const existingProject = await this.ProjectModel.findOne({
      $or: [{ name }, { address }],
    }).exec();

    if (existingProject) {
      throw new ConflictException('This name or address already exists');
    }
    try {
      const createdProject = new this.ProjectModel(createProjectDto);
      return await createdProject.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error Creating Project',
        error.message,
      );
    }
  }

  async findAll() {
    try {
      return await this.ProjectModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching projects',
        error.message,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }
    try {
      const project = await this.ProjectModel.findById(id);
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching project',
        error.message,
      );
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    if (!id || !updateProjectDto) {
      throw new BadRequestException('Project ID and Update Data are required');
    }
    try {
      const updatedProject = await this.ProjectModel.findByIdAndUpdate(
        id,
        updateProjectDto,
        { new: true },
      ).exec();

      if (!updatedProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return updatedProject;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating project',
        error.message,
      );
    }
  }

  async remove(id: string) {
    if (!id) throw new BadRequestException('Project ID is required');

    try {
      const result = await this.ProjectModel.deleteOne({ _id: id });
      if (!result)
        throw new NotFoundException(`Project with ID ${id} not found`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting project',
        error.message,
      );
    }
  }
}
