import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto.' })
  @IsEmail(
    {},
    {
      message:
        'Por favor, introduce una dirección de correo electrónico válida.',
    },
  )
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  readonly email: string;
}
