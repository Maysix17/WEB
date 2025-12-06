import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';
import { MedicionSensorService } from './medicion_sensor.service';
import { CreateMedicionSensorDto } from './dto/create-medicion_sensor.dto';
import { UpdateMedicionSensorDto } from './dto/update-medicion_sensor.dto';
import { SensorSearchResponseDto } from './dto/sensor-search-response.dto';
import { HistoricalSensorDataResponseDto } from './dto/historical-sensor-data.dto';
import { ReportDataRequestDto } from './dto/report-data-request.dto';
import { ReportDataResponseDto } from './dto/report-data-response.dto';
import { CsvExportResponseDto } from './dto/csv-export-response.dto';
import { CultivosZonasResponseDto } from './dto/cultivos-zonas-response.dto';
import { SensorAlertsResponseDto } from './dto/sensor-alerts-response.dto';
import { RawChartDataResponseDto } from './dto/raw-chart-data-response.dto';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('medicion-sensor')
export class MedicionSensorController {
  constructor(private readonly medicionSensorService: MedicionSensorService) {}

  @Permisos({
    recurso: 'medicion_sensor',
    acciones: ['crear'],
    moduloNombre: 'Medición Sensor',
  })
  @Post()
  create(@Body() createMedicionSensorDto: CreateMedicionSensorDto) {
    return this.medicionSensorService.create(createMedicionSensorDto);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['crear'],
    moduloNombre: 'Zonas',
  })
  @Post('batch')
  createBatch(@Body() createMedicionSensorDtos: CreateMedicionSensorDto[]) {
    return this.medicionSensorService.saveBatch(createMedicionSensorDtos);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get()
  findAll() {
    return this.medicionSensorService.findAll();
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get('zona/:zonaId')
  findByZona(@Param('zonaId') zonaId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.medicionSensorService.findRecentByZona(zonaId, limitNum);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get('mqtt-config/:mqttConfigId')
  findByMqttConfig(@Param('mqttConfigId') mqttConfigId: string) {
    return this.medicionSensorService.findByMqttConfig(mqttConfigId);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get('sensor-search')
  getSensorSearchData(): Promise<SensorSearchResponseDto> {
    return this.medicionSensorService.getSensorSearchData();
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Post('historical-data')
  getHistoricalSensorData(
    @Body()
    body: {
      sensorKeys: string[];
      startDate?: string;
      endDate?: string;
    },
  ): Promise<HistoricalSensorDataResponseDto> {
    const { sensorKeys, startDate, endDate } = body;
    return this.medicionSensorService.getHistoricalSensorData(
      sensorKeys || [],
      startDate,
      endDate,
    );
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Post('report-data')
  getReportData(
    @Body() request: ReportDataRequestDto,
  ): Promise<ReportDataResponseDto[]> {
    return this.medicionSensorService.getReportData(request);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Post('csv-export')
  getCsvExportData(
    @Body() request: ReportDataRequestDto,
  ): Promise<CsvExportResponseDto> {
    return this.medicionSensorService.getCsvExportData(request);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Post('alerts')
  getSensorAlerts(
    @Body() request: ReportDataRequestDto,
  ): Promise<SensorAlertsResponseDto> {
    return this.medicionSensorService.getSensorAlerts(request);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Post('raw-chart-data')
  getRawChartData(
    @Body() request: ReportDataRequestDto,
  ): Promise<RawChartDataResponseDto> {
    return this.medicionSensorService.getRawChartData(request);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get('by-cultivos-zonas')
  getCultivosZonas(): Promise<CultivosZonasResponseDto[]> {
    return this.medicionSensorService.getCultivosZonas();
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicionSensorService.findOne(id);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['actualizar'],
    moduloNombre: 'Zonas',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicionSensorDto: UpdateMedicionSensorDto,
  ) {
    return this.medicionSensorService.update(id, updateMedicionSensorDto);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['eliminar'],
    moduloNombre: 'Zonas',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicionSensorService.remove(id);
  }
}
