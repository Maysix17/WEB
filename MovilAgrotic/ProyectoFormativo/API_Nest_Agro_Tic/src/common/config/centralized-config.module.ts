import { Module } from '@nestjs/common';
import { CentralizedConfigService } from './centralized-config.service';

@Module({
  providers: [CentralizedConfigService],
  exports: [CentralizedConfigService],
})
export class CentralizedConfigModule {}