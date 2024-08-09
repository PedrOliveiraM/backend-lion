import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { extname, join, resolve } from 'path';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';
import { Response } from 'express';
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // teste com validação
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, callback) => {
          const allowedImageTypes = /png|jpg|jpeg/;
          const allowedModelTypes = /rvt|obj|mtl/;

          const ext = extname(file.originalname).toLowerCase();
          if (file.fieldname === 'image' && allowedImageTypes.test(ext)) {
            callback(null, true);
          } else if (
            file.fieldname === 'model' &&
            allowedModelTypes.test(ext)
          ) {
            callback(null, true);
          } else {
            callback(
              new BadRequestException(
                `Invalid file type for ${file.fieldname}`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async uploadFiles(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; model?: Express.Multer.File[] },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    try {
      if (
        !createProjectDto.name ||
        !createProjectDto.area ||
        !createProjectDto.enterprise_id
      ) {
        throw new BadRequestException(
          `Data is required ${createProjectDto.name} 
          ${createProjectDto.area} 
          ${createProjectDto.address}`,
        );
      }
      if (!files || !files.image || !files.model) {
        throw new BadRequestException(
          'Both image and model files are required',
        );
      }
      createProjectDto.image = files.image[0].path;
      createProjectDto.model = files.model[0].path;
      return await this.projectsService.create(createProjectDto);
    } catch (error) {
      if (files.image && files.image[0].path) {
        unlinkSync(files.image[0].path);
      }
      if (files.model && files.model[0].path) {
        unlinkSync(files.model[0].path);
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }
  @Get('all/:id')
  findAllByEnterpriseId(@Param('id') id: string) {
    return this.projectsService.findAllByEnterpriseId(id);
  }

  @Get('/files/:name')
  async getUploadedFile(@Param('name') fileName: string, @Res() res: Response) {
    return this.projectsService.sendFile(fileName, res);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, callback) => {
          const allowedImageTypes = /png|jpg|jpeg/;
          const allowedModelTypes = /rvt|obj|mtl/;

          const ext = extname(file.originalname).toLowerCase();
          if (file.fieldname === 'image' && allowedImageTypes.test(ext)) {
            callback(null, true);
          } else if (
            file.fieldname === 'model' &&
            allowedModelTypes.test(ext)
          ) {
            callback(null, true);
          } else {
            callback(
              new BadRequestException(
                `Invalid file type for ${file.fieldname}`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async updateProject(
    @Param('id') id: string,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; model?: Express.Multer.File[] },
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    // Localizar o projeto existente
    const existingProject = await this.projectsService.findOne(id);
    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const uploadsDir = resolve(__dirname, '../../'); // Ajuste o caminho base para a pasta uploads

    // Se novo arquivo de imagem for enviado, remova o antigo e atualize o caminho
    if (files?.image && files.image.length > 0) {
      if (existingProject.image) {
        const oldImagePath = join(uploadsDir, existingProject.image);
        if (existsSync(oldImagePath)) {
          try {
            unlinkSync(oldImagePath);
          } catch (err) {
            throw new InternalServerErrorException(
              'Error deleting old image file',
            );
          }
        }
      }
      updateProjectDto.image = files.image[0].path;
    }

    // Se novo arquivo de modelo for enviado, remova o antigo e atualize o caminho
    if (files?.model && files.model.length > 0) {
      if (existingProject.model) {
        const oldModelPath = join(uploadsDir, existingProject.model);
        if (existsSync(oldModelPath)) {
          try {
            unlinkSync(oldModelPath);
          } catch (err) {
            throw new InternalServerErrorException(
              'Error deleting old model file',
            );
          }
        }
      }
      updateProjectDto.model = files.model[0].path;
    }

    // Atualizar o projeto no banco de dados
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
