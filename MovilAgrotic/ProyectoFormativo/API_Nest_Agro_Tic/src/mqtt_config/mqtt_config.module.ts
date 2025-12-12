import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttConfigService } from './mqtt_config.service';
import { MqttConfig } from './entities/mqtt_config.entity';
import { ZonaMqttConfig } from './entities/zona_mqtt_config.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([MqttConfig, ZonaMqttConfig]), AuthModule],
  providers: [MqttConfigService],
  exports: [MqttConfigService],
})
export class MqttConfigModule {}
