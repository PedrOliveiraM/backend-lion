import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Component } from './entities/component.entity';
import { Model } from 'mongoose';

@Injectable()
export class ComponentsService {
  constructor(
    @InjectModel(Component.name) private ComponentModel: Model<Component>,
  ) {}

  async create(createComponentDto: CreateComponentDto) {
    try {
      const createdComponent = new this.ComponentModel(createComponentDto);
      return await createdComponent.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating component: ' + error.message,
      );
    }
  }

  async findAll() {
    try {
      return await this.ComponentModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching components: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const component = await this.ComponentModel.findById(id).exec();
      if (!component) {
        throw new NotFoundException(`Component with id ${id} not found`);
      }
      return component;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching component: ' + error.message,
      );
    }
  }

  async findAllByProjectId(id: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      const components = await this.ComponentModel.find({
        element_id: id,
      }).exec();
      if (!components || components.length === 0) {
        throw new NotFoundException(
          `No components found with project_id ${id}`,
        );
      }
      return components;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching components: ' + error.message,
      );
    }
  }

  async update(id: string, updateComponentDto: UpdateComponentDto) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const updatedComponent = await this.ComponentModel.findByIdAndUpdate(
        id,
        updateComponentDto,
        {
          new: true,
        },
      ).exec();

      if (!updatedComponent) {
        throw new NotFoundException(`Component with id ${id} not found`);
      }

      return updatedComponent;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating component: ' + error.message,
      );
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const deletedComponent = await this.ComponentModel.deleteOne({ _id: id });
      if (!deletedComponent) {
        throw new NotFoundException(`Component with id ${id} not found`);
      }
      return deletedComponent;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error removing component: ' + error.message,
      );
    }
  }
}
