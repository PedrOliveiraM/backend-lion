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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // pasta onde os arquivos serão salvos
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
      },
    ),
  )
  async uploadFiles(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; model?: Express.Multer.File[] },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    if (!files || !files.image || !files.model) {
      throw new BadRequestException('Both image and model files are required');
    }

    createProjectDto.image = files.image[0].path;
    createProjectDto.model = files.model[0].path;

    return this.projectsService.createWithFiles(createProjectDto);
  }

  // teste com validação
  @Post('uploaded')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'model', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // Pasta onde os arquivos serão salvos
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
  async uploadFilesValidation(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; model?: Express.Multer.File[] },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    if (!files || !files.image || !files.model) {
      throw new BadRequestException('Both image and model files are required');
    }

    createProjectDto.image = files.image[0].path;
    createProjectDto.model = files.model[0].path;

    return this.projectsService.createWithFiles(createProjectDto);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
