import * as classValidator from 'class-validator';

export class CreateComponentDto {
  @classValidator.IsString()
  material: string;

  @classValidator.IsNumber()
  quantity: number;

  @classValidator.IsString()
  energy_efficiency: string;

  @classValidator.IsString()
  element_id: string;
}
