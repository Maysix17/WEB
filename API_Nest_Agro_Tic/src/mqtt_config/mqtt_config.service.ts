import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { MqttConfig } from './entities/mqtt_config.entity';
import { ZonaMqttConfig } from './entities/zona_mqtt_config.entity';
import { CreateMqttConfigDto } from './dto/create-mqtt_config.dto';
import { UpdateMqttConfigDto } from './dto/update-mqtt_config.dto';

@Injectable()
export class MqttConfigService {
  constructor(
    @InjectRepository(MqttConfig)
    private readonly mqttConfigRepository: Repository<MqttConfig>,
    @InjectRepository(ZonaMqttConfig)
    private readonly zonaMqttConfigRepository: Repository<ZonaMqttConfig>,
  ) {}

  async create(createMqttConfigDto: CreateMqttConfigDto): Promise<MqttConfig> {
    const mqttConfig = this.mqttConfigRepository.create({
      ...createMqttConfigDto,
      port: parseInt(createMqttConfigDto.port, 10),
    });
    return await this.mqttConfigRepository.save(mqttConfig);
  }

  async findAll(): Promise<MqttConfig[]> {
    return await this.mqttConfigRepository.find({
      relations: ['zonaMqttConfigs', 'zonaMqttConfigs.zona'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MqttConfig | null> {
    return await this.mqttConfigRepository.findOne({
      where: { id },
      relations: ['zonaMqttConfigs', 'zonaMqttConfigs.zona'],
    });
  }

  async findByZona(zonaId: string): Promise<ZonaMqttConfig | null> {
    return await this.zonaMqttConfigRepository.findOne({
      where: { fkZonaId: zonaId, estado: true },
      relations: ['mqttConfig', 'zona'],
    });
  }

  async findActive(): Promise<MqttConfig[]> {
    return await this.mqttConfigRepository.find({
      where: { activa: true },
      relations: ['zonaMqttConfigs', 'zonaMqttConfigs.zona'],
    });
  }

  async findActiveZonaMqttConfigs(): Promise<ZonaMqttConfig[]> {
    return await this.zonaMqttConfigRepository.find({
      where: { estado: true },
      relations: ['mqttConfig', 'zona'],
    });
  }

  async update(id: string, updateMqttConfigDto: UpdateMqttConfigDto): Promise<MqttConfig> {
    const updateData: any = { ...updateMqttConfigDto };
    if (updateMqttConfigDto.port) {
      updateData.port = parseInt(updateMqttConfigDto.port as string, 10);
    }
    await this.mqttConfigRepository.update(id, updateData);
    const result = await this.findOne(id);
    if (!result) throw new Error('Configuración no encontrada');
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.mqttConfigRepository.delete(id);
  }

  // ZonaMqttConfig methods
  async assignConfigToZona(zonaId: string, configId: string): Promise<{ success: boolean; data?: ZonaMqttConfig; error?: { configName: string; zonaName: string } }> {
    // Check if this config is already actively assigned to another zona
    const activeAssignment = await this.zonaMqttConfigRepository.findOne({
      where: {
        fkMqttConfigId: configId,
        estado: true,
        fkZonaId: Not(zonaId) // Not the current zona
      },
      relations: ['zona', 'mqttConfig'],
    });

    if (activeAssignment) {
      const configName = activeAssignment.mqttConfig?.nombre || 'Unknown Configuration';
      const zonaName = activeAssignment.zona?.nombre || 'Unknown Zone';
      return { success: false, error: { configName, zonaName } };
    }

    // Check if this config is already assigned to this zona (even if inactive)
    const existingAssignment = await this.zonaMqttConfigRepository.findOne({
      where: { fkZonaId: zonaId, fkMqttConfigId: configId },
    });

    if (existingAssignment) {
      if (existingAssignment.estado) {
        // Already active, no need to do anything
        return { success: true, data: existingAssignment };
      } else {
        // Reactivate the existing assignment
        await this.zonaMqttConfigRepository.update(existingAssignment.id, { estado: true });
        const result = await this.zonaMqttConfigRepository.findOne({
          where: { id: existingAssignment.id },
          relations: ['mqttConfig', 'zona'],
        });
        return { success: true, data: result || undefined };
      }
    }

    // Create new assignment
    const zonaMqttConfig = this.zonaMqttConfigRepository.create({
      fkZonaId: zonaId,
      fkMqttConfigId: configId,
      estado: true,
    });

    const saved = await this.zonaMqttConfigRepository.save(zonaMqttConfig);

    // Load relations for the MQTT service
    const result = await this.zonaMqttConfigRepository.findOne({
      where: { id: saved.id },
      relations: ['mqttConfig', 'zona'],
    });

    if (!result) {
      throw new Error('Failed to load assigned configuration with relations');
    }

    return { success: true, data: result };
  }

  async unassignConfigFromZona(zonaId: string, configId: string): Promise<void> {
    await this.zonaMqttConfigRepository.update(
      { fkZonaId: zonaId, fkMqttConfigId: configId },
      { estado: false }
    );
  }

  async getZonaMqttConfigs(zonaId: string): Promise<ZonaMqttConfig[]> {
    return await this.zonaMqttConfigRepository.find({
      where: { fkZonaId: zonaId, estado: true },
      relations: ['mqttConfig', 'zona'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveZonaMqttConfig(zonaId: string): Promise<ZonaMqttConfig | null> {
    return await this.zonaMqttConfigRepository.findOne({
      where: { fkZonaId: zonaId, estado: true },
      relations: ['mqttConfig', 'zona'],
    });
  }

  async getZonaMqttConfigsByConfig(configId: string): Promise<ZonaMqttConfig[]> {
    return await this.zonaMqttConfigRepository.find({
      where: { fkMqttConfigId: configId },
      relations: ['mqttConfig', 'zona'],
      order: { createdAt: 'DESC' },
    });
  }
}