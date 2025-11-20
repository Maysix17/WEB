import jsPDF from 'jspdf';
import apiClient from '../lib/axios/axios';
import { renderLineChartToCanvas } from './chartRenderer';

interface SelectedData {
  cultivos: string[];
  zonas: string[];
  sensores: string[];
  startDate: string;
  endDate: string;
  groupBy: 'hourly' | 'daily' | 'weekly';
}

interface ReportDataResponse {
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

// Interface removed as it's not currently used

// Utility function to format date ranges
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
};

// Utility function to format groupBy for display
const formatGroupBy = (groupBy: string): string => {
  switch (groupBy) {
    case 'hourly':
      return 'Hourly';
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    default:
      return groupBy;
  }
};

// Utility function to wrap text for PDF
const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
  const pdf = new jsPDF();
  pdf.setFontSize(fontSize);
  const lines = pdf.splitTextToSize(text, maxWidth);
  return lines;
};

export const generatePDFReport = async (selectedData: SelectedData): Promise<void> => {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Make API call to get report data
    const reportRequest = {
      med_keys: selectedData.sensores,
      cultivo_ids: selectedData.cultivos.length > 0 ? selectedData.cultivos : undefined,
      zona_ids: selectedData.zonas.length > 0 ? selectedData.zonas : undefined,
      start_date: selectedData.startDate,
      end_date: selectedData.endDate,
      group_by: selectedData.groupBy,
    };

    const reportResponse = await apiClient.post('/medicion-sensor/report-data', reportRequest);
    const reportData: ReportDataResponse[] = reportResponse.data;

    // Header Section
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Agro TIC - Sensor Report', 20, yPosition);
    yPosition += 20;

    // Report Information Box
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Background box for report info
    pdf.setFillColor(240, 248, 255);
    pdf.rect(15, yPosition - 5, 180, 35, 'F');
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(15, yPosition - 5, 180, 35);
    
    pdf.text('Report Configuration', 20, yPosition);
    yPosition += 8;
    
    const dateRange = formatDateRange(selectedData.startDate, selectedData.endDate);
    pdf.text(`Date Range: ${dateRange}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Grouping: ${formatGroupBy(selectedData.groupBy)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Sensors: ${selectedData.sensores.length} | Zones: ${selectedData.zonas.length} | Crops: ${selectedData.cultivos.length}`, 20, yPosition);
    yPosition += 15;

    // Summary Statistics Section
    if (reportData.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 10;

      // Overall statistics
      const totalDataPoints = reportData.reduce((sum, item) => 
        sum + item.statistics.reduce((statSum, stat) => statSum + stat.count, 0), 0
      );
      
      const uniqueSensors = new Set(reportData.flatMap(item => 
        item.statistics.map(stat => stat.med_key)
      )).size;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Data Points: ${totalDataPoints}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Unique Sensors: ${uniqueSensors}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Report Periods: ${reportData.length}`, 20, yPosition);
      yPosition += 15;
    }

    // Detailed Statistics Table
    if (reportData.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Statistics by Period', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      const headers = ['Period', 'Crop', 'Zone', 'Sensor', 'Count', 'Min', 'Max', 'Avg'];
      const colWidths = [25, 30, 25, 25, 15, 15, 15, 15];
      let xPosition = 20;
      
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 3;
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      reportData.forEach((item) => {
        item.statistics.forEach((stat) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
            
            // Repeat headers on new page
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            xPosition = 20;
            headers.forEach((header, index) => {
              pdf.text(header, xPosition, yPosition);
              xPosition += colWidths[index];
            });
            yPosition += 3;
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 5;
            pdf.setFont('helvetica', 'normal');
          }

          xPosition = 20;
          const rowData = [
            item.period.substring(0, 10),
            item.cultivoNombre.substring(0, 12),
            item.zonaNombre.substring(0, 12),
            stat.med_key.substring(0, 12),
            stat.count.toString(),
            stat.min.toFixed(2),
            stat.max.toFixed(2),
            stat.avg.toFixed(2)
          ];

          rowData.forEach((data, index) => {
            pdf.text(data, xPosition, yPosition);
            xPosition += colWidths[index];
          });
          yPosition += 6;
        });
      });

      yPosition += 10;
    }

    // Enhanced Charts Section with Individual Sensor Trends
    if (selectedData.sensores.length > 0 && reportData.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sensor Trend Analysis', 20, yPosition);
      yPosition += 10;

      // Fetch historical data for chart generation
      const historicalResponse = await apiClient.post('/medicion-sensor/historical-data', {
        sensorKeys: selectedData.sensores
      });
      
      const historicalData = historicalResponse.data;

      // Filter data by date range
      const startDate = new Date(selectedData.startDate);
      const endDate = new Date(selectedData.endDate);
      const filteredDataPoints = historicalData.dataPoints?.filter((p: any) => {
        const pointDate = new Date(p.timestamp);
        return pointDate >= startDate && pointDate <= endDate;
      }) || [];

      // Group data by sensor for individual charts
      const sensorGroups = new Map<string, any[]>();
      filteredDataPoints.forEach((p: any) => {
        if (!sensorGroups.has(p.sensorKey)) {
          sensorGroups.set(p.sensorKey, []);
        }
        sensorGroups.get(p.sensorKey)!.push(p);
      });

      // Generate individual trend charts for each sensor
      for (const sensorKey of selectedData.sensores) {
        const sensorData = sensorGroups.get(sensorKey) || [];
        
        if (sensorData.length === 0) continue;

        // Check if we need a new page
        if (yPosition + 80 > 280) {
          pdf.addPage();
          yPosition = 20;
        }

        // Prepare enhanced chart data with proper time formatting
        const chartData = sensorData
          .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((item: any) => ({
            time: item.timestamp,
            value: Number(item.value),
          }));

        // Get sensor info for subtitle
        const sensorInfo = sensorData[0];
        const subtitle = `${sensorInfo?.zonaNombre || 'Unknown Zone'} | ${sensorInfo?.cultivoNombre || 'Unknown Crop'} | ${sensorInfo?.unidad || ''}`;

        try {
          // Generate individual sensor trend chart
          const canvas = await renderLineChartToCanvas({
            width: 400,
            height: 220,
            data: chartData,
            title: `Trend: ${sensorKey}`,
            subtitle: subtitle,
            color: '#2563eb',
            type: 'line',
            yAxisLabel: `Value (${sensorInfo?.unidad || ''})`,
            xAxisLabel: 'Time Period',
            sensorKey: sensorKey,
            unidad: sensorInfo?.unidad || ''
          });

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 60);
          
          // Add enhanced sensor information
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Sensor Information:', 20, yPosition + 70);
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          const infoY = yPosition + 78;
          pdf.text(`Key: ${sensorKey}`, 20, infoY);
          pdf.text(`Zone: ${sensorInfo?.zonaNombre || 'Unknown'}`, 20, infoY + 6);
          pdf.text(`Crop: ${sensorInfo?.cultivoNombre || 'Unknown'}`, 20, infoY + 12);
          pdf.text(`Data Points: ${sensorData.length}`, 20, infoY + 18);
          pdf.text(`Period: ${formatDateRange(selectedData.startDate, selectedData.endDate)}`, 20, infoY + 24);
          
          // Calculate and display statistics
          const values = chartData.map(d => d.value);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          
          pdf.text(`Min: ${min.toFixed(2)}`, 120, infoY);
          pdf.text(`Max: ${max.toFixed(2)}`, 120, infoY + 6);
          pdf.text(`Avg: ${avg.toFixed(2)}`, 120, infoY + 12);
          
          yPosition += 110; // Increased spacing for better layout
        } catch (chartError) {
          console.error(`Error generating chart for ${sensorKey}:`, chartError);
          pdf.setFontSize(10);
          pdf.setTextColor(255, 0, 0); // Red color for error
          pdf.text(`Chart generation failed for sensor: ${sensorKey}`, 20, yPosition);
          pdf.setTextColor(0, 0, 0); // Reset to black
          yPosition += 15;
        }
      }

      // Add a summary chart comparing all sensors if multiple sensors selected
      if (selectedData.sensores.length > 1 && sensorGroups.size > 0) {
        if (yPosition + 80 > 280) {
          pdf.addPage();
          yPosition = 20;
        }

        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Comparative Sensor Analysis', 20, yPosition);
        yPosition += 10;

        // Prepare comparative data by grouping by time periods
        const timeGroups = new Map<string, any>();
        
        sensorGroups.forEach((data, sensorKey) => {
          data.forEach((item: any) => {
            const dateKey = new Date(item.timestamp).toISOString().split('T')[0]; // Group by day
            if (!timeGroups.has(dateKey)) {
              timeGroups.set(dateKey, {});
            }
            timeGroups.get(dateKey)[sensorKey] = item.value;
          });
        });

        // Convert to chart format
        const comparativeData: any[] = [];
        Array.from(timeGroups.entries())
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .forEach(([date, values]) => {
            comparativeData.push({
              time: date,
              ...values
            });
          });

        if (comparativeData.length > 0) {
          try {
            const canvas = await renderLineChartToCanvas({
              width: 400,
              height: 200,
              data: comparativeData,
              title: 'Multi-Sensor Comparison',
              subtitle: 'Daily averages across selected sensors',
              color: '#2563eb',
              type: 'line',
              multiLine: true,
              yAxisLabel: 'Sensor Values',
              xAxisLabel: 'Date'
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 50);
            yPosition += 60;
          } catch (chartError) {
            console.error('Error generating comparative chart:', chartError);
            pdf.setFontSize(10);
            pdf.setTextColor(255, 0, 0);
            pdf.text('Failed to generate comparative chart', 20, yPosition);
            pdf.setTextColor(0, 0, 0);
            yPosition += 15;
          }
        }
      }
    }

    // Footer with generation info
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
        20, 285
      );
    }

    // Save PDF
    const fileName = `sensor-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report. Please check your data and try again.');
  }
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
  try {
    console.log('Selected details:', selectedDetails);

    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Sensores Seleccionados por Zona', 20, yPosition);
    yPosition += 20;

    // Selected sensors info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
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

    // Filter data by date range if available in historical data
    let filteredDataPoints = historicalData.dataPoints;
    if (historicalData.dateRange && historicalData.dateRange.start && historicalData.dateRange.end) {
      const startDate = new Date(historicalData.dateRange.start);
      const endDate = new Date(historicalData.dateRange.end);
      filteredDataPoints = historicalData.dataPoints.filter((p: any) => {
        const pointDate = new Date(p.timestamp);
        return pointDate >= startDate && pointDate <= endDate;
      });
    }

    // Date range info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Información del Período', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    let dateRange: string;
    if (historicalData.dateRange && historicalData.dateRange.start) {
      dateRange = formatDateRange(
        historicalData.dateRange.start.split('T')[0],
        historicalData.dateRange.end.split('T')[0]
      );
    } else {
      dateRange = 'No date range information available';
    }
    pdf.text(`Período: ${dateRange}`, 20, yPosition);
    pdf.text(`Data points en el período: ${filteredDataPoints.length}`, 20, yPosition + 6);
    yPosition += 20;

    // Averages section per selected sensor
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Promedios por Sensor y Zona', 20, yPosition);
    yPosition += 10;

    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    const searchHeaders = ['Cultivo', 'Zona', 'Sensor', 'Valor/Promedio', 'Conteo'];
    const searchColWidths = [35, 30, 30, 30, 25];
    let searchXPosition = 20;
    
    searchHeaders.forEach((header, index) => {
      pdf.text(header, searchXPosition, yPosition);
      searchXPosition += searchColWidths[index];
    });
    
    yPosition += 3;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    selectedDetails.forEach((detail) => {
      console.log('Processing detail:', detail);
      const dataPoints = filteredDataPoints.filter((p: any) =>
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
        
        // Repeat headers on new page
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        searchXPosition = 20;
        searchHeaders.forEach((header, index) => {
          pdf.text(header, searchXPosition, yPosition);
          searchXPosition += searchColWidths[index];
        });
        yPosition += 3;
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
      }

      searchXPosition = 20;
      const searchRowData = [
        cultivoNombre.substring(0, 15),
        zonaNombre.substring(0, 15),
        detail.sensorKey,
        `${valueOrAvg.toFixed(2)} ${unidad}`,
        count.toString()
      ];

      searchRowData.forEach((data, index) => {
        pdf.text(data, searchXPosition, yPosition);
        searchXPosition += searchColWidths[index];
      });
      yPosition += 8;
    });

    yPosition += 20;

    // Enhanced combined charts for all selections
    if (selectedDetails.length >= 1) {
      console.log('Generating enhanced trend charts');
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análisis de Tendencias de Sensores', 20, yPosition);
      yPosition += 10;

      // Group data by sensor for better visualization
      const sensorGroups = new Map<string, any[]>();
      filteredDataPoints.forEach((p: any) => {
        if (!sensorGroups.has(p.sensorKey)) {
          sensorGroups.set(p.sensorKey, []);
        }
        sensorGroups.get(p.sensorKey)!.push(p);
      });

      // Generate individual charts for each sensor first
      for (const detail of selectedDetails) {
        const dataPoints = sensorGroups.get(detail.sensorKey) || [];
        if (dataPoints.length === 0) continue;

        if (yPosition + 80 > 280) {
          pdf.addPage();
          yPosition = 20;
        }

        // Prepare chart data
        const chartData = dataPoints
          .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((item: any) => ({
            time: item.timestamp,
            value: Number(item.value),
          }));

        const subtitle = `${detail.zonaNombre} | ${detail.cultivoNombre} | ${detail.variedadNombre}`;

        try {
          const canvas = await renderLineChartToCanvas({
            width: 400,
            height: 220,
            data: chartData,
            title: `Sensor: ${detail.sensorKey}`,
            subtitle: subtitle,
            color: '#059669',
            type: 'line',
            yAxisLabel: 'Sensor Value',
            xAxisLabel: 'Time Period',
            sensorKey: detail.sensorKey,
            unidad: dataPoints[0]?.unidad || ''
          });

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 60);
          
          // Add sensor statistics
          const values = chartData.map(d => d.value);
          const stats = {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length
          };

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          const statsY = yPosition + 70;
          pdf.text(`Data Points: ${stats.count}`, 20, statsY);
          pdf.text(`Min: ${stats.min.toFixed(2)}`, 20, statsY + 6);
          pdf.text(`Max: ${stats.max.toFixed(2)}`, 20, statsY + 12);
          pdf.text(`Avg: ${stats.avg.toFixed(2)}`, 20, statsY + 18);
          
          yPosition += 90;
        } catch (error) {
          console.error(`Error generating chart for ${detail.sensorKey}:`, error);
          pdf.setFontSize(10);
          pdf.setTextColor(255, 0, 0);
          pdf.text(`Error generando gráfico para sensor: ${detail.sensorKey}`, 20, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 15;
        }
      }

      // Generate comparative analysis chart if multiple sensors
      if (selectedDetails.length > 1) {
        if (yPosition + 80 > 280) {
          pdf.addPage();
          yPosition = 20;
        }

        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Análisis Comparativo', 20, yPosition);
        yPosition += 10;

        // Prepare daily aggregated data for comparison
        const dailyData: { time: string; [key: string]: any }[] = [];
        const dailyMap = new Map<string, { [key: string]: number[] }>();

        // Group by day and sensor
        sensorGroups.forEach((dataPoints, sensorKey) => {
          dataPoints.forEach((point: any) => {
            const dayKey = new Date(point.timestamp).toISOString().split('T')[0];
            if (!dailyMap.has(dayKey)) {
              dailyMap.set(dayKey, {});
            }
            if (!dailyMap.get(dayKey)![sensorKey]) {
              dailyMap.get(dayKey)![sensorKey] = [];
            }
            dailyMap.get(dayKey)![sensorKey].push(Number(point.value));
          });
        });

        // Calculate daily averages
        dailyMap.forEach((sensorValues, day) => {
          const dayData: any = { time: day };
          Object.entries(sensorValues).forEach(([sensorKey, values]) => {
            dayData[sensorKey] = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
          });
          dailyData.push(dayData);
        });

        // Sort by date
        dailyData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        if (dailyData.length > 0) {
          try {
            const canvas = await renderLineChartToCanvas({
              width: 400,
              height: 200,
              data: dailyData,
              title: 'Comparación Diaria de Sensores',
              subtitle: 'Promedios diarios por sensor',
              color: '#2563eb',
              type: 'line',
              multiLine: true,
              yAxisLabel: 'Valores Promedio',
              xAxisLabel: 'Fecha'
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 50);
            yPosition += 60;
          } catch (error) {
            console.error('Error generating comparative chart:', error);
            pdf.setFontSize(10);
            pdf.setTextColor(255, 0, 0);
            pdf.text('Error generando gráfico comparativo', 20, yPosition);
            pdf.setTextColor(0, 0, 0);
            yPosition += 15;
          }
        }
      }
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
        20, 285
      );
    }

    // Save PDF
    pdf.save(`reporte-sensores-zona-${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating sensor search PDF:', error);
    throw new Error('Failed to generate sensor search PDF. Please check your data and try again.');
  }
};