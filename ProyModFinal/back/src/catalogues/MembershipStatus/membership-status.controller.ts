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
import { MembershipStatusService } from './membership-status.service';
import { CreateMembershipStatusDto } from './dto/create-membership-status.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('membership-status')
export class MembershipStatusController {
  constructor(
    private readonly membershipStatusService: MembershipStatusService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Post()
  create(@Body() dto: CreateMembershipStatusDto) {
    return this.membershipStatusService.create(dto);
  }

  @Get()
  findAll() {
    return this.membershipStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipStatusService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMembershipStatusDto,
  ) {
    return this.membershipStatusService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membershipStatusService.delete(id);
  }
}
