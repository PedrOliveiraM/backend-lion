import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { Enterprise } from './entities/enterprise.entity';
import { ProjectsService } from 'src/projects/projects.service';

@Injectable()
export class EnterprisesService {
  constructor(
    @InjectModel(Enterprise.name) private EnterpriseModel: Model<Enterprise>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createEnterpriseDto: CreateEnterpriseDto): Promise<Enterprise> {
    const { name, userId } = createEnterpriseDto;

    // Verificação básica das entradas
    if (!name || !userId) {
      throw new BadRequestException('Name and ID are required fields');
    }

    try {
      // Verificar se já existe um empreendimento com o mesmo nome e ID
      const existingEnterprise = await this.EnterpriseModel.findOne({
        name,
        userId,
      });
      if (existingEnterprise) {
        throw new ConflictException(
          'Enterprise with the same name and ID already exists',
        );
      }

      // Criar um novo empreendimento
      const createdEnterprise = new this.EnterpriseModel(createEnterpriseDto);
      return await createdEnterprise.save();
    } catch (error) {
      // Capturar erros de Mongoose (erros de conexão, etc.)
      if (error.name === 'MongoError' || error.name === 'MongooseError') {
        throw new InternalServerErrorException('Database error occurred');
      }
      // Rethrow the caught exception (e.g., ConflictException, BadRequestException)
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.EnterpriseModel.find().exec();
    } catch (error) {
      throw new BadRequestException(
        'Error fetching enterprises: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Enterprise Id is required');
    }
    try {
      const enterprise = await this.EnterpriseModel.findById(id).exec();
      return enterprise;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching enterprise: ' + error.message,
      );
    }
  }

  async findAllByUserId(id: string) {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    try {
      const user = await this.EnterpriseModel.find({
        userId: id,
      }).exec();

      if (!user || user.length === 0) {
        throw new NotFoundException('No user found with the provided user id');
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding enterprises by user id: ' + error.message,
      );
    }
  }

  async update(id: string, updateEnterpriseDto: UpdateEnterpriseDto) {
    if (!id || !updateEnterpriseDto)
      throw new BadRequestException(
        'Enterprise ID and update data are required',
      );

    try {
      const updatedEnterprise = await this.EnterpriseModel.findByIdAndUpdate(
        id,
        updateEnterpriseDto,
        { new: true },
      ).exec();
      if (!updatedEnterprise)
        throw new NotFoundException(`Enterprise with ID ${id} not found`);
      return updatedEnterprise;
    } catch (error) {
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Enterprise ID is required');
    }

    try {
      // Buscar o enterprise
      const enterprise = await this.EnterpriseModel.findById(id).exec();

      // Verificar se o enterprise existe
      if (!enterprise) {
        throw new NotFoundException(`Enterprise with ID ${id} not found`);
      }

      // Buscar todos os projetos vinculados ao enterprise
      const projectsBindEnterprise =
        await this.projectsService.findAllByEnterpriseId(
          enterprise._id.toString(),
        );

      // Se não houver projetos vinculados, continue com a remoção do enterprise
      if (projectsBindEnterprise.length > 0) {
        await this.removeProjects(projectsBindEnterprise);
      }

      // Remover o enterprise
      const result = await this.EnterpriseModel.deleteOne({ _id: id }).exec();

      // Verificar se a remoção foi bem-sucedida
      if (result.deletedCount === 0) {
        throw new NotFoundException(
          `Enterprise with ID ${id} not found or already deleted`,
        );
      }

      return {
        message: 'Enterprise and associated projects deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting enterprise:', error);
      throw new InternalServerErrorException(
        'Error deleting enterprise in database: ' + error.message,
      );
    }
  }

  // Método para remover os projetos
  private async removeProjects(projects: any[]) {
    const removePromises = projects.map(
      (project) => this.projectsService.remove(project._id.toString()), // Chamando o método de remoção do projeto
    );

    await Promise.all(removePromises);
  }
}
