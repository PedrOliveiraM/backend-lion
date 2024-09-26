import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { ProjectsModule } from './projects/projects.module';
import { DependenciesModule } from './dependencies/dependencies.module';
import { ElementsModule } from './elements/elements.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        console.log('MongoDB URI:', uri); // Linha de depuração
        return { uri };
      },
      inject: [ConfigService],
    }),
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
