import React from "react";
import FitosanitarioButtons from "../components/molecules/Botons"; 

const FitosanitarioPage: React.FC = () => {
  return (
    <div className="ml-60 p-8">
      <h2 className="text-2xl font-bold mb-4">Fitosanitario</h2>
      <FitosanitarioButtons />
    </div>
  );
};

export default FitosanitarioPage;
