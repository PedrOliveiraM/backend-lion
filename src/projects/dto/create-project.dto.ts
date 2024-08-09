import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  area: string;

  @IsString()
  enterprise_id: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  model: string;
}
