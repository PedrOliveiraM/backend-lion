import { IsString } from 'class-validator';

export class CreateElementDto {
  @IsString()
  name: string;

  @IsString()
  dependency_id: string;
}
