import { Module } from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { DependenciesController } from './dependencies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Dependency, DependencySchema } from './entities/dependency.entity';
import { ElementsModule } from 'src/elements/elements.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dependency.name, schema: DependencySchema },
    ]),
    ElementsModule,
  ],
  controllers: [DependenciesController],
  providers: [DependenciesService],
  exports: [DependenciesService],
})
export class DependenciesModule {}
