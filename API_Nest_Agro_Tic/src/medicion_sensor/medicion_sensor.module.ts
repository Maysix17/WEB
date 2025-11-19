import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionSensorService } from './medicion_sensor.service';
import { MedicionSensorController } from './medicion_sensor.controller';
import { MedicionSensor } from './entities/medicion_sensor.entity';
import { ZonaMqttConfig } from '../mqtt_config/entities/zona_mqtt_config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicionSensor, ZonaMqttConfig])],
  controllers: [MedicionSensorController],
  providers: [MedicionSensorService],
  exports: [MedicionSensorService],
})
export class MedicionSensorModule {}
