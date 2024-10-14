import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateElementDto } from './dto/create-element.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Element } from './entities/element.entity';
import { ComponentsService } from 'src/components/components.service';

@Injectable()
export class ElementsService {
  constructor(
    @InjectModel(Element.name) private ElementModel: Model<Element>,
    private readonly componentService: ComponentsService,
  ) {}

  async create(createElementDto: CreateElementDto) {
    if (!createElementDto) {
      throw new BadRequestException('Element data is required');
    }

    const { name, dependency_id } = createElementDto;

    const existElement = await this.ElementModel.findOne({
      $and: [{ name }, { dependency_id }],
    }).exec();

    if (existElement) {
      throw new ConflictException('Name or dependency_id already exists');
    }
    try {
      const createdElement = new this.ElementModel(createElementDto);
      return await createdElement.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating element: ' + error.message,
      );
    }
  }

  async findAll() {
    try {
      const elements = await this.ElementModel.find().exec();
      return elements;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching elements');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const element = await this.ElementModel.findById(id).exec();

      if (!element) {
        throw new NotFoundException('Element not found');
      }

      return element;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding element by ID: ' + error.message,
      );
    }
  }

  async findAllByDependencyId(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const elements = await this.ElementModel.find({
        dependency_id: id,
      }).exec();

      if (!elements || elements.length === 0) {
        throw new NotFoundException(
          'No elements found with the provided dependency_id',
        );
      }

      return elements;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding elements by dependency_id: ' + error.message,
      );
    }
  }

  async update(id: string, updateElementDto: UpdateElementDto) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    if (!updateElementDto) {
      throw new BadRequestException('Element data is required');
    }

    try {
      const updatedElement = await this.ElementModel.findByIdAndUpdate(
        id,
        updateElementDto,
        { new: true },
      ).exec();

      if (!updatedElement) {
        throw new NotFoundException('Element not found');
      }

      return updatedElement;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating element in database: ' + error.message,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Element ID is required');
    }

    try {
      // Buscar o elemento
      const element = await this.ElementModel.findById(id).exec();

      // Verificar se o elemento existe
      if (!element) {
        throw new NotFoundException('Element not found');
      }

      // Buscar todos os components vinculados ao element
      const componentsBindElement =
        await this.componentService.findAllByElementId(element._id.toString());

      // Remover todos os components vinculados ao element
      if (componentsBindElement.length > 0) {
        await this.removeComponents(componentsBindElement);
      }

      // Remover o elemento
      const result = await this.ElementModel.deleteOne({ _id: id }).exec();

      // Verificar se a remoção foi bem-sucedida
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Element with ID ${id} not found`);
      }

      return { message: 'Element deleted successfully' };
    } catch (error) {
      console.error('Error removing element:', error);
      throw new InternalServerErrorException(
        'Error deleting element in database: ' + error.message,
      );
    }
  }

  // Método para remover os components
  private async removeComponents(components: any[]) {
    const removePromises = components.map((component) =>
      this.componentService.remove(component._id.toString()),
    );

    await Promise.all(removePromises);
  }
}
