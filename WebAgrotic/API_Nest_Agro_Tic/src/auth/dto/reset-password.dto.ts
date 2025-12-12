import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña no puede estar vacía.' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres.',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número o caracter especial.',
  })
  readonly newPassword: string;

  // ✅ CAMBIO: Se añade el campo para repetir la contraseña.
  @IsString()
  @IsNotEmpty({ message: 'Debes repetir la nueva contraseña.' })
  readonly repetPassword: string;
}
