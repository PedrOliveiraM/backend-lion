import { IsString } from 'class-validator';
export class CreateDependencyDto {
  @IsString()
  name: string;
  @IsString()
  project_id: string;
}
