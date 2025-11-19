import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

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
  color?: string;
  multiLine?: boolean;
  type?: 'line' | 'bar';
}

export const renderLineChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { width, height, data, title, color = '#8884d8', multiLine = false, type = 'line' } = config;

  // Create a container div
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  // Colors for multi-line
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  // Get data keys for lines
  const dataKeys = multiLine ? Object.keys(data[0] || {}).filter(key => key !== 'time') : ['value'];

  // Create the chart content
  const chartContent = (
    <div style={{ width: '100%', height: '100%', padding: '10px', backgroundColor: 'white' }}>
      {title && (
        <h3 style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={title ? height - 40 : height}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }}
            />
            <YAxis tick={{ fontSize: 10 }} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }}
            />
            <YAxis tick={{ fontSize: 10 }} />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
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
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Use html2canvas to capture the chart
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: 'white',
      useCORS: true,
      allowTaint: true,
    });

    return canvas;
  } finally {
    // Clean up
    root.unmount();
    document.body.removeChild(container);
  }
};

export const renderBarChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { width, height, data, title, color = '#82ca9d' } = config;

  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  const chartContent = (
    <div style={{ width: '100%', height: '100%', padding: '10px', backgroundColor: 'white' }}>
      {title && (
        <h3 style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={title ? height - 40 : height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Bar dataKey="value" fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const root = createRoot(container);
  root.render(chartContent);
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: 'white',
      useCORS: true,
      allowTaint: true,
    });

    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};

export const renderAreaChartToCanvas = async (config: ChartConfig): Promise<HTMLCanvasElement> => {
  const { width, height, data, title, color = '#ffc658' } = config;

  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  const chartContent = (
    <div style={{ width: '100%', height: '100%', padding: '10px', backgroundColor: 'white' }}>
      {title && (
        <h3 style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={title ? height - 40 : height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const root = createRoot(container);
  root.render(chartContent);
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: 2,
      backgroundColor: 'white',
      useCORS: true,
      allowTaint: true,
    });

    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};