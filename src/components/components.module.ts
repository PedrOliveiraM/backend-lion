import { Module } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Component, ComponentSchema } from './entities/component.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Component.name, schema: ComponentSchema },
    ]),
  ],
  controllers: [ComponentsController],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
