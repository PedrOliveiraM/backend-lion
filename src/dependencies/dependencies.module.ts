import { Module } from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { DependenciesController } from './dependencies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Dependency, DependencySchema } from './entities/dependency.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dependency.name, schema: DependencySchema },
    ]),
  ],
  controllers: [DependenciesController],
  providers: [DependenciesService],
})
export class DependenciesModule {}
