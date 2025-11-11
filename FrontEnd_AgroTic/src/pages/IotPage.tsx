import React, { useState, useCallback } from 'react';
import SensorDashboard from '../components/organisms/SensorDashboard';

const IotPage: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    // Search is handled automatically by useEffect in SensorDashboard
  }, []);

  const handleClear = useCallback(() => {
    setFilters({});
  }, []);

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