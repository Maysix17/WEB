import { Module } from '@nestjs/common';
import { CultivosXVariedadService } from './cultivos_x_variedad.service';
import { CultivosXVariedadController } from './cultivos_x_variedad.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CultivosXVariedadController],
  providers: [CultivosXVariedadService],
})
export class CultivosXVariedadModule {}
