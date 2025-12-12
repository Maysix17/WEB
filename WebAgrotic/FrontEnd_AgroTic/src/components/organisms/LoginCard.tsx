import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import LoginForm from "../molecules/LoginForm";
import type { LoginCardProps } from "../../types/login.types";

const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  return (
    <Card className="p-6 w-full max-w-sm shadow-lg">
      <CardHeader className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold">Inicia Sesión</h2>
        <p className="text-sm text-gray-500">Inicie sesión en tu cuenta</p>
      </CardHeader>
      <CardBody>
        <LoginForm onLogin={onLogin} />
      </CardBody>
    </Card>
  );
};

export default LoginCard;
