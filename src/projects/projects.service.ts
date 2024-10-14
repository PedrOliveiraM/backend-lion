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
import { existsSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { Response } from 'express';
import { DependenciesService } from 'src/dependencies/dependencies.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private ProjectModel: Model<Project>,
    private readonly dependencyService: DependenciesService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    if (!createProjectDto) {
      throw new BadRequestException('Project data is required');
    }
    const { name, address, enterprise_id } = createProjectDto;
    const existingProject = await this.ProjectModel.findOne({
      $and: [{ name }, { address }, { enterprise_id }],
    }).exec();

    if (existingProject) {
      throw new ConflictException(
        'This name or address already exists with enterprise id',
      );
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
      const project = await this.ProjectModel.findOne({
        _id: id,
      });
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

  async findAllByEnterpriseId(id: string) {
    if (!id) {
      throw new BadRequestException('Enterprise ID is required');
    }

    try {
      const projects = await this.ProjectModel.find({
        enterprise_id: id,
      }).exec();
      if (!projects || projects.length === 0) {
        throw new NotFoundException(
          `No projects found with enterprise_id ${id}`,
        );
      }
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching components: ' + error.message,
      );
    }
  }

  sendFile(fileName: string, res: Response) {
    const filePath = join(__dirname, '../../uploads', fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`File ${fileName} not found`);
    }

    return res.sendFile(filePath);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Verifica se o projeto existe
    const existingProject: UpdateProjectDto =
      await this.ProjectModel.findById(id);
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updatedProject = await this.ProjectModel.findByIdAndUpdate(
      id,
      updateProjectDto,
      { new: true },
    ).exec();
    if (!updatedProject)
      throw new NotFoundException(`Enterprise with ID ${id} not found`);
    return updatedProject;
  }

  async remove(id: string) {
    if (!id) throw new BadRequestException('Project ID is required');

    try {
      const project = await this.ProjectModel.findOne({ _id: id }).exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      const uploadsDir = resolve(__dirname, '../../');

      // Remove image if exists
      if (project.image) {
        const imagePath = join(uploadsDir, project.image);
        if (existsSync(imagePath)) {
          try {
            unlinkSync(imagePath);
          } catch (err) {
            console.error('Error details:', err);
            throw new InternalServerErrorException('Error deleting image file');
          }
        } else {
          console.warn('Image file does not exist:', imagePath);
        }
      }

      // Remove model if exists
      if (project.model) {
        const modelPath = join(uploadsDir, project.model);
        if (existsSync(modelPath)) {
          try {
            unlinkSync(modelPath);
          } catch (err) {
            console.error('Error details:', err);
            throw new InternalServerErrorException('Error deleting model file');
          }
        } else {
          console.warn('Model file does not exist:', modelPath);
        }
      }

      // Remove dependencies associated with this project
      const dependencyBindProject =
        await this.dependencyService.findAllByProjectId(project._id.toString());

      // Remover dependências apenas se existirem
      if (dependencyBindProject.length > 0) {
        await this.removeDependencies(dependencyBindProject);
      }

      // Remove the project itself
      const result = await this.ProjectModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return { message: 'Project deleted successfully' }; // Retornar uma mensagem de sucesso
    } catch (error) {
      console.error('Error removing project:', error);
      throw new InternalServerErrorException(
        'Error deleting project: ' + error.message,
      );
    }
  }

  // Method to remove dependencies separately
  private async removeDependencies(dependencies: any[]) {
    const removePromises = dependencies.map((dependency) =>
      this.dependencyService.remove(dependency._id.toString()),
    );

    await Promise.all(removePromises);
  }
}
