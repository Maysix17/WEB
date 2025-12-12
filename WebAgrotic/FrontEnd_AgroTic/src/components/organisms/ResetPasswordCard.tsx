import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import ResetPasswordForm from "../molecules/ResetPasswordForm";

const ResetPasswordCard: React.FC = () => {
  return (
    <Card className="p-6 w-full max-w-sm shadow-lg">
      <CardHeader className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold">Restablecer Contraseña</h2>
        <p className="text-sm text-gray-500 mt-1 px-2">
          Ingresa tu nueva contraseña para continuar.
        </p>
      </CardHeader>
      <CardBody>
        <ResetPasswordForm />
      </CardBody>
    </Card>
  );
};

export default ResetPasswordCard;
