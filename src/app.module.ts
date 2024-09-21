import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { ProjectsModule } from './projects/projects.module';
import { DependenciesModule } from './dependencies/dependencies.module';
import { ElementsModule } from './elements/elements.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://pedrodev:9j6u2BF2bhshTJuR@crudnest.vzjqsu9.mongodb.net/',
    ),
    UsersModule,
    EnterprisesModule,
    ProjectsModule,
    DependenciesModule,
    ElementsModule,
    ComponentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
