import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { UpdateDependencyDto } from './dto/update-dependency.dto';

@Controller('dependencies')
export class DependenciesController {
  constructor(private readonly dependenciesService: DependenciesService) {}

  @Post()
  create(@Body() createDependencyDto: CreateDependencyDto) {
    return this.dependenciesService.create(createDependencyDto);
  }

  @Get()
  findAll() {
    return this.dependenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dependenciesService.findOne(id);
  }

  @Get('all/:id')
  findAllByProjectId(@Param('id') id: string) {
    return this.dependenciesService.findAllByProjectId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDependencyDto: UpdateDependencyDto,
  ) {
    return this.dependenciesService.update(id, updateDependencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dependenciesService.remove(id);
  }
}
