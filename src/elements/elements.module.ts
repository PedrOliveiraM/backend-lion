import { Module } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ElementSchema } from './entities/element.entity';
import { Element } from './entities/element.entity';
import { ComponentsModule } from 'src/components/components.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Element.name, schema: ElementSchema }]),
    ComponentsModule,
  ],
  controllers: [ElementsController],
  providers: [ElementsService],
  exports: [ElementsService],
})
export class ElementsModule {}
