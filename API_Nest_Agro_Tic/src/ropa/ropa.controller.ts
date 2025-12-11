import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RopaService } from './ropa.service';
import { CreateRopaDto } from './dto/create-ropa.dto';
import { UpdateRopaDto } from './dto/update-ropa.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';

@UseGuards(AuthenticationGuard)
@Controller('ropa')
export class RopaController {
  constructor(private readonly ropaService: RopaService) {}

  @Post()
  async create(@Body() createRopaDto: CreateRopaDto) {
    return await this.ropaService.create(createRopaDto);
  }

  @Get()
  async findAll() {
    return await this.ropaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ropaService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRopaDto: UpdateRopaDto,
  ) {
    return await this.ropaService.update(id, updateRopaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ropaService.remove(id);
  }
}