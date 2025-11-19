import jsPDF from 'jspdf';
import apiClient from '../lib/axios/axios';
import { renderLineChartToCanvas } from './chartRenderer';

interface SelectedData {
  cultivos: string[];
  zonas: string[];
  sensores: string[];
}

interface ReportData {
  cultivoId: string;
  cultivoNombre: string;
  variedadNombre: string;
  zonaId: string;
  zonaNombre: string;
  cvzId: string;
  period: string;
  statistics: SensorStatistics[];
}

interface SensorStatistics {
  med_key: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
  stddev: number;
}

interface SensorData {
  id: string;
  key: string;
  valor: number;
  unidad: string;
  fechaMedicion: string;
  zonaMqttConfig: {
    zona: {
      nombre: string;
    };
  };
}

export const generatePDFReport = async (selectedData: SelectedData): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Sensor Report', 20, yPosition);
  yPosition += 20;

  // Key Data Section
  pdf.setFontSize(16);
  pdf.text('Key Data', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Selected Crops: ${selectedData.cultivos.length}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Selected Zones: ${selectedData.zonas.length}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Selected Sensors: ${selectedData.sensores.length}`, 20, yPosition);
  yPosition += 20;

  // Fetch report data
  const reportRequest = {
    med_keys: selectedData.sensores,
    cultivo_ids: selectedData.cultivos.length > 0 ? selectedData.cultivos : undefined,
    zona_ids: selectedData.zonas.length > 0 ? selectedData.zonas : undefined,
    group_by: 'daily' as const,
  };

  const reportResponse = await apiClient.post('/medicion-sensor/report-data', reportRequest);
  const reportData: ReportData[] = reportResponse.data;

  // Statistics Table
  pdf.setFontSize(16);
  pdf.text('Statistics', 20, yPosition);
  yPosition += 10;

  // Table headers
  pdf.setFontSize(10);
  pdf.text('Period', 20, yPosition);
  pdf.text('Crop', 60, yPosition);
  pdf.text('Zone', 100, yPosition);
  pdf.text('Sensor', 140, yPosition);
  pdf.text('Avg', 170, yPosition);
  yPosition += 5;

  // Draw line
  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 5;

  // Table rows
  reportData.forEach((item) => {
    item.statistics.forEach((stat) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(item.period, 20, yPosition);
      pdf.text(item.cultivoNombre.substring(0, 15), 60, yPosition);
      pdf.text(item.zonaNombre.substring(0, 15), 100, yPosition);
      pdf.text(stat.med_key.substring(0, 15), 140, yPosition);
      pdf.text(stat.avg.toFixed(2), 170, yPosition);
      yPosition += 8;
    });
  });

  yPosition += 20;

  // Charts Section
  pdf.setFontSize(16);
  pdf.text('Charts', 20, yPosition);
  yPosition += 10;

  // Fetch raw sensor data for charts
  const allSensorResponse = await apiClient.get('/medicion-sensor');
  const allSensorData: any[] = allSensorResponse.data;

  const sensorDataArrays = selectedData.sensores.map(sensorKey =>
    allSensorData.filter((item: any) => item.key === sensorKey).slice(0, 100)
  );

  for (let i = 0; i < selectedData.sensores.length; i++) {
    const sensorKey = selectedData.sensores[i];
    const sensorData: any[] = sensorDataArrays[i];

    if (sensorData.length === 0) continue;

    // Prepare chart data
    const chartData = sensorData
      .sort((a: any, b: any) => new Date(a.fechaMedicion).getTime() - new Date(b.fechaMedicion).getTime())
      .map((item: any) => ({
        time: item.fechaMedicion,
        value: item.valor,
      }));

    // Generate chart canvas
    const canvas = await renderLineChartToCanvas({
      width: 400,
      height: 200,
      data: chartData,
      title: `Sensor: ${sensorKey}`,
      color: '#8884d8',
    });

    // Add chart to PDF
    if (yPosition + 60 > 280) {
      pdf.addPage();
      yPosition = 20;
    }

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 50);
    yPosition += 60;
  }

  // Save PDF
  pdf.save('sensor-report.pdf');
};

interface SelectedSensorDetail {
  cultivoId: string;
  zonaId: string;
  sensorKey: string;
  zonaNombre: string;
  cultivoNombre: string;
  variedadNombre: string;
}

export const generateSensorSearchPDF = async (selectedDetails: SelectedSensorDetail[]): Promise<void> => {
  console.log('Selected details:', selectedDetails);

  const pdf = new jsPDF();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Reporte de Sensores Seleccionados por Zona', 20, yPosition);
  yPosition += 20;

  // Selected sensors info
  pdf.setFontSize(14);
  const selectedInfo = selectedDetails.map(d => `${d.sensorKey} (${d.zonaNombre})`).join(', ');
  pdf.text(`Sensores seleccionados: ${selectedInfo}`, 20, yPosition);
  yPosition += 20;

  // Fetch historical data for all unique sensor keys
  const uniqueSensorKeys = [...new Set(selectedDetails.map(d => d.sensorKey))];
  console.log('Unique sensor keys:', uniqueSensorKeys);

  const historicalResponse = await apiClient.post('/medicion-sensor/historical-data', {
    sensorKeys: uniqueSensorKeys
  });
  const historicalData = historicalResponse.data;
  console.log('Historical data:', historicalData);

  // Date range
  pdf.setFontSize(12);
  pdf.text(`Período: ${new Date(historicalData.dateRange.start).toLocaleDateString()} - ${new Date(historicalData.dateRange.end).toLocaleDateString()}`, 20, yPosition);
  yPosition += 20;

  // Averages section per selected sensor
  pdf.setFontSize(16);
  pdf.text('Promedios por Sensor y Zona', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.text('Cultivo', 20, yPosition);
  pdf.text('Zona', 60, yPosition);
  pdf.text('Sensor', 100, yPosition);
  pdf.text('Valor/Promedio', 140, yPosition);
  pdf.text('Conteo', 170, yPosition);
  yPosition += 5;

  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 5;

  selectedDetails.forEach((detail) => {
    console.log('Processing detail:', detail);
    const dataPoints = historicalData.dataPoints.filter((p: any) =>
      p.sensorKey === detail.sensorKey
    );
    console.log('Filtered dataPoints for', detail.sensorKey, ':', dataPoints);
    if (dataPoints.length === 0) return;

    const count = dataPoints.length;
    const unidad = dataPoints[0]?.unidad || '';
    const zonaNombre = dataPoints[0]?.zonaNombre || detail.zonaNombre;
    const cultivoNombre = dataPoints[0]?.cultivoNombre || detail.cultivoNombre;
    const valueOrAvg = count === 1 ? Number(dataPoints[0].value) : (dataPoints.reduce((sum: number, p: any) => sum + Number(p.value), 0) / count);

    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.text(cultivoNombre.substring(0, 15), 20, yPosition);
    pdf.text(zonaNombre.substring(0, 15), 60, yPosition);
    pdf.text(detail.sensorKey, 100, yPosition);
    pdf.text(valueOrAvg.toFixed(2), 140, yPosition);
    pdf.text(count.toString(), 170, yPosition);
    yPosition += 8;
  });

  yPosition += 20;

  // Combined chart if multiple selections
  if (selectedDetails.length >= 1) {
    console.log('Generating trend chart');
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.text('Gráfico de Tendencia de Sensores', 20, yPosition);
    yPosition += 10;

    // Prepare combined data grouped by hour
    const combinedData: { time: string; [key: string]: any }[] = [];
    const hourMap = new Map<string, { [key: string]: number[] }>();

    selectedDetails.forEach((detail) => {
      const dataPoints = historicalData.dataPoints.filter((p: any) =>
        p.sensorKey === detail.sensorKey
      );
      console.log('DataPoints for trend:', detail, dataPoints.length);

      dataPoints.forEach((point: any) => {
        const date = new Date(point.timestamp);
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        if (!hourMap.has(hourKey)) {
          hourMap.set(hourKey, {});
        }
        if (!hourMap.get(hourKey)![detail.sensorKey]) {
          hourMap.get(hourKey)![detail.sensorKey] = [];
        }
        hourMap.get(hourKey)![detail.sensorKey].push(Number(point.value));
      });
    });

    for (const [hour, sensorValues] of hourMap.entries()) {
      const avgValues: { [key: string]: number } = {};
      for (const sensorKey in sensorValues) {
        const values = sensorValues[sensorKey];
        avgValues[sensorKey] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
      combinedData.push({ time: new Date(hour + ':00'), ...avgValues });
    }

    combinedData.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
    console.log('Combined hourly data:', combinedData);

    // Generate bar chart
    try {
      console.log('Generating chart with data:', combinedData);
      const canvas = await renderLineChartToCanvas({
        width: 400,
        height: 200,
        data: combinedData,
        title: 'Tendencia de Sensores por Hora',
        color: '#8884d8',
        multiLine: selectedDetails.length > 1,
        type: 'bar',
      });

      if (yPosition + 60 > 280) {
        pdf.addPage();
        yPosition = 20;
      }

      const imgData = canvas.toDataURL('image/png');
      console.log('Chart generated, imgData length:', imgData.length);
      pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 50);
      yPosition += 60;
    } catch (error) {
      console.error('Error generating chart:', error);
    }
  }

  // Save PDF
  pdf.save(`reporte-sensores-zona-${new Date().toISOString().split('T')[0]}.pdf`);
};