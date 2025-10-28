import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ActividadesService } from './actividades.service';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imgUrl', {
      storage: diskStorage({
        destination: './uploads/actividades',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() dto: CreateActividadeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('ActividadesController create - dto.fechaAsignacion:', dto.fechaAsignacion);
    console.log('ActividadesController create - dto.fechaAsignacion type:', typeof dto.fechaAsignacion);
    console.log('ActividadesController create - dto.fechaAsignacion ISO:', dto.fechaAsignacion.toISOString());

    const imgUrl = file ? `/uploads/actividades/${file.filename}` : '';
    return this.actividadesService.create({ ...dto, imgUrl });
  }

  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get('count-by-date/:date')
  countByDate(@Param('date') date: string) {
    return this.actividadesService.countByDate(date);
  }

  @Get('by-date/:date')
  findByDate(@Param('date') date: string) {
    return this.actividadesService.findByDate(date);
  }

  @Get('by-date-active/:date')
  findByDateWithActive(@Param('date') date: string) {
    return this.actividadesService.findByDateWithActive(date);
  }

  @Get('by-date-range')
  findByDateRange(@Query('start') start: string, @Query('end') end: string) {
    return this.actividadesService.findByDateRange(start, end);
  }

  @Get('by-cultivo-variedad-zona/:cvzId')
  findByCultivoVariedadZonaId(@Param('cvzId') cvzId: string) {
    return this.actividadesService.findByCultivoVariedadZonaId(cvzId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActividadeDto) {
    return this.actividadesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }

  @Patch(':id/finalizar')
  @UseInterceptors(
    FileInterceptor('imgUrl', {
      storage: diskStorage({
        destination: './uploads/evidencias',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  finalizar(
    @Param('id') id: string,
    @Body() body: { observacion?: string; horas?: number; precioHora?: number },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imgUrl = file ? `/uploads/evidencias/${file.filename}` : undefined;
    return this.actividadesService.finalizar(
      id,
      body.observacion,
      imgUrl,
      body.horas,
      body.precioHora,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/evidencias',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/evidencias/${file.filename}` };
  }

  // New endpoints for reservation management

  @Post(':id/reservas')
  createReservation(
    @Param('id') actividadId: string,
    @Body()
    body: { loteId: string; cantidadReservada: number; estadoId?: number },
  ) {
    return this.actividadesService.createReservation(
      actividadId,
      body.loteId,
      body.cantidadReservada,
      body.estadoId,
    );
  }

  @Post(':id/reservas/producto')
  createReservationByProduct(
    @Param('id') actividadId: string,
    @Body()
    body: { productId: string; cantidadReservada: number; estadoId?: number },
  ) {
    return this.actividadesService.createReservationByProduct(
      actividadId,
      body.productId,
      body.cantidadReservada,
      body.estadoId,
    );
  }

  @Patch('reservas/:reservaId/confirm-usage')
  confirmUsage(
    @Param('reservaId') reservaId: string,
    @Body() body: { cantidadUsada: number },
  ) {
    return this.actividadesService.confirmUsage(reservaId, body.cantidadUsada);
  }

  @Get(':id/cost')
  calculateCost(@Param('id') actividadId: string) {
    return this.actividadesService.calculateCost(actividadId);
  }

  @Get(':id/reservas')
  getReservationsByActivity(@Param('id') actividadId: string) {
    return this.actividadesService.getReservationsByActivity(actividadId);
  }
}
