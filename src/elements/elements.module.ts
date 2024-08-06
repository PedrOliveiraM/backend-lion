import { Module } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ElementSchema } from './entities/element.entity';
import { Element } from './entities/element.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Element.name, schema: ElementSchema }]),
  ],
  controllers: [ElementsController],
  providers: [ElementsService],
})
export class ElementsModule {}
