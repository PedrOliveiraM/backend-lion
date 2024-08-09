import { IsNumber, IsString } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  material: string;

  @IsNumber()
  quantity: number;

  @IsString()
  energy_efficiency: string;

  @IsString()
  element_id: string;
}
