import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicionSensor } from './entities/medicion_sensor.entity';
import { CreateMedicionSensorDto } from './dto/create-medicion_sensor.dto';
import { UpdateMedicionSensorDto } from './dto/update-medicion_sensor.dto';

@Injectable()
export class MedicionSensorService {
  constructor(
    @InjectRepository(MedicionSensor)
    private readonly medicionSensorRepository: Repository<MedicionSensor>,
  ) {}

  async create(createMedicionSensorDto: CreateMedicionSensorDto): Promise<MedicionSensor> {
    const medicion = this.medicionSensorRepository.create(createMedicionSensorDto);
    return await this.medicionSensorRepository.save(medicion);
  }

  async findAll(): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository.find({
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
      order: { fechaMedicion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MedicionSensor | null> {
    return await this.medicionSensorRepository.findOne({
      where: { id },
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
    });
  }

  async findByZona(zonaId: string): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository.find({
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
      where: {
        zonaMqttConfig: {
          fkZonaId: zonaId,
          estado: true
        }
      },
      order: { fechaMedicion: 'DESC' },
    });
  }

  async findByMqttConfig(mqttConfigId: string): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository.find({
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
      where: {
        zonaMqttConfig: {
          fkMqttConfigId: mqttConfigId,
          estado: true
        }
      },
      order: { fechaMedicion: 'DESC' },
    });
  }

  async findRecentByZona(zonaId: string, limit: number = 50): Promise<MedicionSensor[]> {
    return await this.medicionSensorRepository.find({
      relations: ['zonaMqttConfig', 'zonaMqttConfig.mqttConfig', 'zonaMqttConfig.zona'],
      where: {
        zonaMqttConfig: {
          fkZonaId: zonaId,
          estado: true
        }
      },
      order: { fechaMedicion: 'DESC' },
      take: limit,
    });
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
}
