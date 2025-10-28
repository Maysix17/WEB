import React from "react";
import TextInput from "../atoms/TextInput";
import type { UserInputsProps } from "../../types/UserInputsProps";

type ErrorState = {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const UserInputs: React.FC<UserInputsProps & { errors?: ErrorState }> = ({
  dni, setDni,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  email, setEmail,
  nombres, setNombres,
  apellidos, setApellidos,
  telefono, setTelefono,
  errors = {}
}) => {
  return (
    <div className="flex flex-col gap-3"> 

      {nombres !== undefined && setNombres && (
        <div>
          <TextInput
            label="Nombres"
            placeholder="Ingrese un nombre"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
          />
          {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
        </div>
      )}

      {apellidos !== undefined && setApellidos && (
        <div>
          <TextInput
            label="Apellidos"
            placeholder="Ingrese un apellido"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
          {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
        </div>
      )}

      {dni !== undefined && setDni && (
        <div>
          <TextInput
            label="DNI"
            placeholder="Ingrese DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
        </div>
      )}

      {email !== undefined && setEmail && (
        <div>
          <TextInput
            label="Correo electrónico"
            type="email"
            placeholder="Ingrese correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      )}

      {telefono !== undefined && setTelefono && (
        <div>
          <TextInput
            label="Teléfono"
            placeholder="Ingrese un teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
        </div>
      )}

      {password !== undefined && setPassword && (
        <div>
          <TextInput
            label="Contraseña"
            type="password"
            placeholder="Ingrese contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
      )}

      {confirmPassword !== undefined && setConfirmPassword && (
        <div>
          <TextInput
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repita la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserInputs;

