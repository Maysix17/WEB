import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MedicionSensorService } from './medicion_sensor.service';
import { CreateMedicionSensorDto } from './dto/create-medicion_sensor.dto';
import { UpdateMedicionSensorDto } from './dto/update-medicion_sensor.dto';

@Controller('medicion-sensor')
export class MedicionSensorController {
  constructor(private readonly medicionSensorService: MedicionSensorService) {}

  @Post()
  create(@Body() createMedicionSensorDto: CreateMedicionSensorDto) {
    return this.medicionSensorService.create(createMedicionSensorDto);
  }

  @Post('batch')
  createBatch(@Body() createMedicionSensorDtos: CreateMedicionSensorDto[]) {
    return this.medicionSensorService.saveBatch(createMedicionSensorDtos);
  }

  @Get()
  findAll() {
    return this.medicionSensorService.findAll();
  }

  @Get('zona/:zonaId')
  findByZona(@Param('zonaId') zonaId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.medicionSensorService.findRecentByZona(zonaId, limitNum);
  }

  @Get('mqtt-config/:mqttConfigId')
  findByMqttConfig(@Param('mqttConfigId') mqttConfigId: string) {
    return this.medicionSensorService.findByMqttConfig(mqttConfigId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicionSensorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicionSensorDto: UpdateMedicionSensorDto,
  ) {
    return this.medicionSensorService.update(id, updateMedicionSensorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicionSensorService.remove(id);
  }
}
