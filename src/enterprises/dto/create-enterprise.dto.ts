import { IsString } from 'class-validator';

export class CreateEnterpriseDto {
  @IsString()
  name: string;

  @IsString()
  region: string;

  @IsString()
  description: string;

  @IsString()
  userId: string;
}
