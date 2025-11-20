import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area, Tooltip, Legend } from 'recharts';

export interface ChartDataPoint {
  time: string;
  value?: number;
  [key: string]: any;
}

export interface ChartConfig {
  width: number;
  height: number;
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  multiLine?: boolean;
  type?: 'line' | 'bar' | 'area';
  yAxisLabel?: string;
  xAxisLabel?: string;
  sensorKey?: string;
  unidad?: string;
}

// Enhanced color palette for professional charts
const colorPalette = [
  '#2563eb', // Blue
  '#dc2626', // Red  
  '#059669', // Green
  '#d97706', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#65a30d', // Lime
  '#ca8a04', // Yellow
  '#be123c'  // Rose
];

// Format time labels based on data granularity
const formatTimeLabel = (value: string, data: any[]) => {
  if (!value) return '';
  const date = new Date(value);
  
  // Check if data has time information beyond just dates
  const hasTime = data.some(d => {
    const dTime = new Date(d.time);
    return dTime.getHours() !== 0 || dTime.getMinutes() !== 0 || dTime.getSeconds() !== 0;
  });
  
  if (hasTime) {
    // Show time for hourly data
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    // Show date for daily/weekly data
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, unidad }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">
          {date.toLocaleDateString([], { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.dataKey}:</span> {entry.value?.toFixed(2)} {unidad || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const renderLineChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { 
    width, 
    height, 
    data, 
    title, 
    subtitle,
    multiLine = false, 
    type = 'line',
    yAxisLabel,
    sensorKey,
    unidad = ''
  } = config;

  // Validate data
  if (!data || data.length === 0) {
    throw new Error('No data provided for chart');
  }

  // Create a container div with enhanced styling
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.padding = '8px';
  document.body.appendChild(container);

  // Get data keys for lines
  const dataKeys = multiLine ? Object.keys(data[0] || {}).filter(key => key !== 'time') : ['value'];
  
  // Use sensor key as the line name if provided
  const getLineName = (key: string) => {
    if (sensorKey && key === 'value') return `Sensor ${sensorKey}`;
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Calculate optimal chart dimensions
  const chartHeight = height - 80; // Reserve space for title and subtitle

  // Create the enhanced chart content
  const chartContent = (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px'
    }}>
      {/* Enhanced Header */}
      {(title || subtitle) && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: '8px'
        }}>
          {title && (
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: '1.2'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: '11px',
              color: '#6b7280',
              margin: 0,
              fontWeight: 'normal'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={chartHeight}>
        {type === 'bar' ? (
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 20, left: 15, bottom: 15 }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              tickFormatter={(value) => formatTimeLabel(value, data)}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } } : undefined}
            />
            <Tooltip content={<CustomTooltip unidad={unidad} />} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colorPalette[index % colorPalette.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 20, left: 15, bottom: 15 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              tickFormatter={(value) => formatTimeLabel(value, data)}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } } : undefined}
            />
            <Tooltip content={<CustomTooltip unidad={unidad} />} />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colorPalette[index % colorPalette.length]}
                fill={colorPalette[index % colorPalette.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 20, left: 15, bottom: 15 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              tickFormatter={(value) => formatTimeLabel(value, data)}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280',
                fontWeight: 500
              }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } } : undefined}
            />
            <Tooltip content={<CustomTooltip unidad={unidad} />} />
            {multiLine && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colorPalette[index % colorPalette.length]}
                strokeWidth={2.5}
                dot={{ 
                  fill: colorPalette[index % colorPalette.length], 
                  strokeWidth: 2, 
                  r: 3 
                }}
                activeDot={{ 
                  r: 5,
                  stroke: colorPalette[index % colorPalette.length],
                  strokeWidth: 2,
                  fill: '#ffffff'
                }}
                name={getLineName(key)}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  // Render the React component
  const root = createRoot(container);
  root.render(chartContent);

  // Wait for render
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Use html2canvas to capture the chart with enhanced settings
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    return canvas;
  } finally {
    // Clean up
    root.unmount();
    document.body.removeChild(container);
  }
};

export const renderBarChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { 
    width, 
    height, 
    data, 
    title, 
    subtitle,
    color = '#2563eb',
    yAxisLabel,
    unidad = ''
  } = config;

  // Validate data
  if (!data || data.length === 0) {
    throw new Error('No data provided for chart');
  }

  // Create a container div with enhanced styling
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.padding = '8px';
  document.body.appendChild(container);

  // Calculate optimal chart dimensions
  const chartHeight = height - 80; // Reserve space for title and subtitle

  const chartContent = (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px'
    }}>
      {/* Enhanced Header */}
      {(title || subtitle) && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: '8px'
        }}>
          {title && (
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: '1.2'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: '11px',
              color: '#6b7280',
              margin: 0,
              fontWeight: 'normal'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 20, left: 15, bottom: 15 }}
          barCategoryGap="20%"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 10, 
              fill: '#6b7280',
              fontWeight: 500
            }}
            tickFormatter={(value) => formatTimeLabel(value, data)}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 10, 
              fill: '#6b7280',
              fontWeight: 500
            }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } } : undefined}
          />
          <Tooltip content={<CustomTooltip unidad={unidad} />} />
          <Bar 
            dataKey="value" 
            fill={color}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const root = createRoot(container);
  root.render(chartContent);
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};

export const renderAreaChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { 
    width, 
    height, 
    data, 
    title, 
    subtitle,
    color = '#2563eb',
    yAxisLabel,
    unidad = ''
  } = config;

  // Validate data
  if (!data || data.length === 0) {
    throw new Error('No data provided for chart');
  }

  // Create a container div with enhanced styling
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.padding = '8px';
  document.body.appendChild(container);

  // Calculate optimal chart dimensions
  const chartHeight = height - 80; // Reserve space for title and subtitle

  const chartContent = (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px'
    }}>
      {/* Enhanced Header */}
      {(title || subtitle) && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: '8px'
        }}>
          {title && (
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: '1.2'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: '11px',
              color: '#6b7280',
              margin: 0,
              fontWeight: 'normal'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 20, left: 15, bottom: 15 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 10, 
              fill: '#6b7280',
              fontWeight: 500
            }}
            tickFormatter={(value) => formatTimeLabel(value, data)}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 10, 
              fill: '#6b7280',
              fontWeight: 500
            }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } } : undefined}
          />
          <Tooltip content={<CustomTooltip unidad={unidad} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const root = createRoot(container);
  root.render(chartContent);
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};