import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
  /*
  Contém pelo menos um dígito (0-9) ou pelo menos um caractere especial.
  Contém pelo menos uma letra maiúscula (A-Z).
  Contém pelo menos uma letra minúscula (a-z).
  Não pode começar com um ponto (.) ou uma nova linha (\n).
  */
}
