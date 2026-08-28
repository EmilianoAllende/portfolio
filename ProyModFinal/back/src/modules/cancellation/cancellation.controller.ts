import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CancellationService } from './cancellation.service';
import { UpdateCancellationDto } from './dto/update-cancellation.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('cancellations')
export class CancellationController {
  constructor(private readonly cancellationService: CancellationService) {}

  //LA CANCELACION DE LA ORDEN SE HACE A  traves de "orders", para que pueda seguir un flujo.
  // estas funcionalidades son de consulta y actualizacion

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  // @UseGuards(AuthGuard)
  findAll() {
    return this.cancellationService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  // @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancellationService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  // @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCancellationDto: UpdateCancellationDto,
  ) {
    return this.cancellationService.update(id, updateCancellationDto);
  }
}
