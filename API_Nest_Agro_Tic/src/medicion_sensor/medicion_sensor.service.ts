import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicionSensor } from './entities/medicion_sensor.entity';
import { ZonaMqttConfig } from '../mqtt_config/entities/zona_mqtt_config.entity';
import { CreateMedicionSensorDto } from './dto/create-medicion_sensor.dto';
import { UpdateMedicionSensorDto } from './dto/update-medicion_sensor.dto';
import { SensorSearchResponseDto, CultivoZonaSensorDto, SensorConfigDto, UniqueSensorDataDto } from './dto/sensor-search-response.dto';
import { HistoricalSensorDataRequestDto, HistoricalSensorDataResponseDto, HistoricalSensorDataPointDto, SensorAverageDto } from './dto/historical-sensor-data.dto';

@Injectable()
export class MedicionSensorService {
  constructor(
    @InjectRepository(MedicionSensor)
    private readonly medicionSensorRepository: Repository<MedicionSensor>,
    @InjectRepository(ZonaMqttConfig)
    private readonly zonaMqttConfigRepository: Repository<ZonaMqttConfig>,
  ) {}

  async create(createMedicionSensorDto: CreateMedicionSensorDto): Promise<MedicionSensor> {
    const medicion = this.medicionSensorRepository.create(createMedicionSensorDto);
    return await this.medicionSensorRepository.save(medicion);
  }

  async findAll(): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository
      .createQueryBuilder('ms')
      .innerJoinAndSelect('ms.zonaMqttConfig', 'zmc')
      .innerJoinAndSelect('zmc.mqttConfig', 'mc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .where('zmc.estado = :estado', { estado: true })
      .orderBy('ms.fechaMedicion', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<MedicionSensor | null> {
    return await this.medicionSensorRepository.findOne({
      where: { id },
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
    });
  }

  async findByZona(zonaId: string): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository
      .createQueryBuilder('ms')
      .innerJoinAndSelect('ms.zonaMqttConfig', 'zmc')
      .innerJoinAndSelect('zmc.mqttConfig', 'mc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .where('zmc.fkZonaId = :zonaId', { zonaId })
      .andWhere('zmc.estado = :estado', { estado: true })
      .orderBy('ms.fechaMedicion', 'DESC')
      .getMany();
  }

  async findByMqttConfig(mqttConfigId: string): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository
      .createQueryBuilder('ms')
      .innerJoinAndSelect('ms.zonaMqttConfig', 'zmc')
      .innerJoinAndSelect('zmc.mqttConfig', 'mc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .where('zmc.fkMqttConfigId = :mqttConfigId', { mqttConfigId })
      .andWhere('zmc.estado = :estado', { estado: true })
      .orderBy('ms.fechaMedicion', 'DESC')
      .getMany();
  }

  async findRecentByZona(zonaId: string, limit: number = 50): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository
      .createQueryBuilder('ms')
      .innerJoinAndSelect('ms.zonaMqttConfig', 'zmc')
      .innerJoinAndSelect('zmc.mqttConfig', 'mc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .where('zmc.fkZonaId = :zonaId', { zonaId })
      .andWhere('zmc.estado = :estado', { estado: true })
      .orderBy('ms.fechaMedicion', 'DESC')
      .take(limit)
      .getMany();
  }

  async update(id: string, updateMedicionSensorDto: UpdateMedicionSensorDto): Promise<MedicionSensor> {
    await this.medicionSensorRepository.update(id, updateMedicionSensorDto);
    const result = await this.findOne(id);
    if (!result) throw new Error('Medición no encontrada');
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.medicionSensorRepository.delete(id);
  }

  async saveBatch(mediciones: CreateMedicionSensorDto[]): Promise<MedicionSensor[]> {
    const entities = this.medicionSensorRepository.create(mediciones);
    return await this.medicionSensorRepository.save(entities);
  }

  async getSensorSearchData(): Promise<SensorSearchResponseDto> {
    // First get all active zona-mqtt configs with their zones
    const zonaMqttConfigs = await this.zonaMqttConfigRepository
      .createQueryBuilder('zmc')
      .innerJoinAndSelect('zmc.mqttConfig', 'mc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .leftJoinAndSelect('z.cultivosVariedad', 'cvz')
      .leftJoinAndSelect('cvz.cultivoXVariedad', 'cxv')
      .leftJoinAndSelect('cxv.variedad', 'v')
      .leftJoinAndSelect('v.tipoCultivo', 'tc')
      .where('zmc.estado = :estado', { estado: true })
      .getMany();

    // Group by unique cultivo-zona combinations
    const groupedData = new Map<string, CultivoZonaSensorDto>();

    for (const zmc of zonaMqttConfigs) {
      const zona = zmc.zona;
      const mqttConfig = zmc.mqttConfig;

      if (!zona || !mqttConfig) continue;

      // Get measurements for this zona-mqtt config
      const measurements = await this.medicionSensorRepository
        .createQueryBuilder('ms')
        .where('ms.fkZonaMqttConfigId = :zmcId', { zmcId: zmc.id })
        .orderBy('ms.fechaMedicion', 'DESC')
        .getMany();

      if (!zona.cultivosVariedad || zona.cultivosVariedad.length === 0) continue;

      zona.cultivosVariedad.forEach(cvz => {
        const cxv = cvz.cultivoXVariedad;
        const variedad = cxv?.variedad;
        const tipoCultivo = variedad?.tipoCultivo;

        if (!cxv || !variedad || !tipoCultivo) return;

        const key = `${cxv.id}-${zona.id}`;

        if (!groupedData.has(key)) {
          groupedData.set(key, {
            cultivoId: cxv.id,
            cultivoNombre: tipoCultivo.nombre,
            variedadNombre: variedad.nombre,
            tipoCultivoNombre: tipoCultivo.nombre,
            zonaId: zona.id,
            zonaNombre: zona.nombre,
            cvzId: cvz.id,
            sensorConfig: {
              id: mqttConfig.id,
              nombre: mqttConfig.nombre,
              host: mqttConfig.host,
              port: mqttConfig.port,
              protocol: mqttConfig.protocol,
              topicBase: mqttConfig.topicBase,
            },
            uniqueSensorData: [],
          });
        }

        // Add unique sensor data (avoid duplicates by key)
        const existingData = groupedData.get(key)!.uniqueSensorData;
        const existingKeys = new Set(existingData.map(d => d.key));

        measurements.forEach(measurement => {
          if (!existingKeys.has(measurement.key)) {
            existingData.push({
              key: measurement.key,
              unidad: measurement.unidad,
              valor: measurement.valor,
              fechaMedicion: measurement.fechaMedicion,
            });
            existingKeys.add(measurement.key);
          }
        });
      });
    }

    return {
      results: Array.from(groupedData.values()),
    };
  }

  async getHistoricalSensorData(sensorKeys: string[]): Promise<HistoricalSensorDataResponseDto> {
    // Get all measurements for the selected sensor keys with related data
    const measurements = await this.medicionSensorRepository
      .createQueryBuilder('ms')
      .innerJoinAndSelect('ms.zonaMqttConfig', 'zmc')
      .innerJoinAndSelect('zmc.zona', 'z')
      .leftJoinAndSelect('z.cultivosVariedad', 'cvz')
      .leftJoinAndSelect('cvz.cultivoXVariedad', 'cxv')
      .leftJoinAndSelect('cxv.variedad', 'v')
      .leftJoinAndSelect('v.tipoCultivo', 'tc')
      .where('ms.key IN (:...sensorKeys)', { sensorKeys })
      .andWhere('zmc.estado = :estado', { estado: true })
      .orderBy('ms.fechaMedicion', 'ASC')
      .getMany();

    // Process data points
    const dataPoints: HistoricalSensorDataPointDto[] = measurements.map(measurement => {
      const zona = measurement.zonaMqttConfig?.zona;
      const cultivosVariedad = zona?.cultivosVariedad || [];
      const firstCultivo = cultivosVariedad[0];

      let cultivoNombre = 'Sin cultivo';
      let variedadNombre = 'Sin variedad';

      if (firstCultivo?.cultivoXVariedad?.variedad?.tipoCultivo) {
        cultivoNombre = firstCultivo.cultivoXVariedad.variedad.tipoCultivo.nombre;
        variedadNombre = firstCultivo.cultivoXVariedad.variedad.nombre;
      }

      return {
        timestamp: measurement.fechaMedicion.toISOString(),
        sensorKey: measurement.key,
        value: measurement.valor,
        unidad: measurement.unidad,
        cultivoNombre,
        zonaNombre: zona?.nombre || 'Sin zona',
        variedadNombre,
      };
    });

    // Calculate averages
    const sensorGroups = dataPoints.reduce((acc, point) => {
      if (!acc[point.sensorKey]) {
        acc[point.sensorKey] = { values: [], unidad: point.unidad };
      }
      acc[point.sensorKey].values.push(point.value);
      return acc;
    }, {} as Record<string, { values: number[]; unidad: string }>);

    const averages: SensorAverageDto[] = Object.entries(sensorGroups).map(([sensorKey, data]) => ({
      sensorKey,
      average: data.values.reduce((sum, val) => sum + val, 0) / data.values.length,
      count: data.values.length,
      unidad: data.unidad,
    }));

    // Get date range
    const timestamps = dataPoints.map(p => new Date(p.timestamp));
    const start = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))).toISOString() : '';
    const end = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))).toISOString() : '';

    return {
      dataPoints,
      averages,
      dateRange: { start, end },
    };
  }
}
