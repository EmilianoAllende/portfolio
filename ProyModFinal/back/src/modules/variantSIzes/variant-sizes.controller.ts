import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { VariantSizesService } from './variant-sizes.service';
import { CreateVariantSizeDto } from './dto/create-variant-sizes.dto';
import { UpdateVariantSizeDto } from './dto/update-variant-sizes.dto';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';
import { EntityManager } from 'typeorm';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('variant-sizes')
export class VariantSizesController {
  constructor(private readonly variantSizesService: VariantSizesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Post()
  create(@Body() createDto: CreateVariantSizeDto) {
    return this.variantSizesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.variantSizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.variantSizesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateVariantSizeDto,
  ) {
    return this.variantSizesService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.variantSizesService.delete(id);
  }
}
