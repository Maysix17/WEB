import type { RegisterFormData } from "./Auth";

export interface RegisterFormProps {
  onRegister?: (formData: RegisterFormData) => void;
}
