import React, { useState } from 'react';
import SensorDashboard from '../components/organisms/SensorDashboard';

const IotPage: React.FC = () => {
  const [filters] = useState<Record<string, any>>({});

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <div style={{ height: 'calc(0px + 93vh)', overflowY: 'auto' }}>
        {/* Sensor Dashboard */}
        <SensorDashboard filters={filters} />
      </div>
    </div>
  );
};

export default IotPage;