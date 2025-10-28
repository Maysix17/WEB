import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionSensorService } from './medicion_sensor.service';
import { MedicionSensorController } from './medicion_sensor.controller';
import { MedicionSensor } from './entities/medicion_sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicionSensor])],
  controllers: [MedicionSensorController],
  providers: [MedicionSensorService],
  exports: [MedicionSensorService],
})
export class MedicionSensorModule {}
