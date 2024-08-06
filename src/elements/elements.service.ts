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

@Injectable()
export class ElementsService {
  constructor(
    @InjectModel(Element.name) private ElementModel: Model<Element>,
  ) {}

  async create(createElementDto: CreateElementDto) {
    if (!createElementDto) {
      throw new BadRequestException('Element data is required');
    }

    const { name, dependency_id } = createElementDto;

    const existElement = await this.ElementModel.findOne({
      $or: [{ name }, { dependency_id }],
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
      throw new BadRequestException('ID is required');
    }

    try {
      const element = await this.ElementModel.findById(id).exec();

      if (!element) {
        throw new NotFoundException('Element not found');
      }

      await this.ElementModel.deleteOne({ _id: id }).exec();
      return { message: 'Element deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting element in database: ' + error.message,
      );
    }
  }
}
