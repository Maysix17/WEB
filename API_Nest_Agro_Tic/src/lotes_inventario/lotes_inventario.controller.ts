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
import { LotesInventarioService } from './lotes_inventario.service';
import { CreateLotesInventarioDto } from './dto/create-lotes_inventario.dto';
import { UpdateLotesInventarioDto } from './dto/update-lotes_inventario.dto';

@Controller('inventario')
export class LotesInventarioController {
  constructor(
    private readonly lotesInventarioService: LotesInventarioService,
  ) {}

  @Post()
  create(@Body() createLotesInventarioDto: CreateLotesInventarioDto) {
    return this.lotesInventarioService.create(createLotesInventarioDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.lotesInventarioService.findAllPaginated(pageNum, limitNum);
  }

  @Get('search/:query')
  search(
    @Param('query') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.lotesInventarioService.search(query, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotesInventarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLotesInventarioDto: UpdateLotesInventarioDto,
  ) {
    return this.lotesInventarioService.update(id, updateLotesInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotesInventarioService.remove(id);
  }

  @Get('available-products')
  getAvailableProducts() {
    return this.lotesInventarioService.getAvailableProducts();
  }
}
