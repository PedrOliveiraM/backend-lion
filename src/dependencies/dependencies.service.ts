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
import { ElementsService } from 'src/elements/elements.service';

@Injectable()
export class DependenciesService {
  constructor(
    @InjectModel(Dependency.name) private DependencyModel: Model<Dependency>,
    private readonly elementService: ElementsService,
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
      // Buscar a dependência
      const dependency = await this.DependencyModel.findOne({ _id: id }).exec();

      // Verificar se a dependência existe
      if (!dependency) {
        throw new NotFoundException(`Dependency with ID ${id} not found`);
      }

      // Buscar todos os elementos vinculados à dependência
      const elementsBindDependency =
        await this.elementService.findAllByDependencyId(
          dependency._id.toString(),
        );

      // Remover todos os elementos vinculados
      if (elementsBindDependency.length > 0) {
        await this.removeElements(elementsBindDependency);
      }

      // Remover a dependência
      const result = await this.DependencyModel.deleteOne({ _id: id }).exec();

      // Verificar se a remoção foi bem-sucedida
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Dependency with ID ${id} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error removing dependency:', error);
      throw new BadRequestException(
        'Error deleting Dependency: ' + error.message,
      );
    }
  }

  // Método para remover os elementos
  private async removeElements(elements: any[]) {
    const removePromises = elements.map((element) =>
      this.elementService.remove(element._id.toString()),
    );

    await Promise.all(removePromises);
  }
}
