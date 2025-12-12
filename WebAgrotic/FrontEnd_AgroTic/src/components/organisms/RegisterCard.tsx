import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import RegisterForm from "../molecules/RegisterForm";
import type { RegisterFormProps } from "../../types/Register";

const RegisterCard: React.FC<RegisterFormProps> = ({ onRegister }) => {
  return (
    <Card className="p-6 w-full max-w-sm shadow-lg">
      <CardHeader className="flex flex-col items-center text-center space-y-1 pb-2">
        <h2 className="text-2xl font-bold">Crear Cuenta</h2>
        <p className="text-sm text-gray-500">Regístrate para continuar</p>
      </CardHeader>

      <CardBody className="pt-0 pb-2">
        <RegisterForm onRegister={onRegister} />
      </CardBody>
    </Card>
  );
};

export default RegisterCard;
