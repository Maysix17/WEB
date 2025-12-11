import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RopaService } from './ropa.service';
import { RopaController } from './ropa.controller';
import { Ropa } from './entities/ropa.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ropa]), AuthModule],
  controllers: [RopaController],
  providers: [RopaService],
})
export class RopaModule {}