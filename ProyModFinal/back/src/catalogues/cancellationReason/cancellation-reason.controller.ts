import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CancellationReasonService } from './cancellation-reason.service';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';
import { UpdateCancellationReasonDto } from './dto/update-cancellation-reason.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('cancellation-reasons')
export class CancellationReasonController {
  constructor(
    private readonly cancellationReasonService: CancellationReasonService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Post()
  create(@Body() dto: CreateCancellationReasonDto) {
    return this.cancellationReasonService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Get()
  findAll() {
    return this.cancellationReasonService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancellationReasonService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCancellationReasonDto,
  ) {
    return this.cancellationReasonService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancellationReasonService.delete(id);
  }
}
