import { Module } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { FichasController } from './fichas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ficha]), AuthModule],
  controllers: [FichasController],
  providers: [FichasService],
})
export class FichasModule {}
