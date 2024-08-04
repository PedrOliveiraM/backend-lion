import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EnterprisesModule } from './enterprises/enterprises.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://pedrodev:9j6u2BF2bhshTJuR@crudnest.vzjqsu9.mongodb.net/',
    ),
    UsersModule,
    EnterprisesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
