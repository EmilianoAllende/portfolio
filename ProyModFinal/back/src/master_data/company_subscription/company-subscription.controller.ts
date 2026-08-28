import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanySubscriptionService } from './company-subscription.service';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { UpdateCompanySubscriptionDto } from './dto/update-company-subscription.dto';
//! roles para admins globales
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
// import { Role } from 'src/modules/roles/entities/role.entity';
// import { UseGuards } from '@nestjs/common';
// import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Controller('company-subscriptions')
// @UseGuards(RolesGuard)
export class CompanySubscriptionController {
  constructor(
    private readonly companySubscriptionService: CompanySubscriptionService,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCompanySubscriptionDto) {
    return this.companySubscriptionService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  findAll() {
    return this.companySubscriptionService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  findOne(@Param('id') id: string) {
    return this.companySubscriptionService.findOne(id);
  }

  @Get('customer/:customerId/active')
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  findActiveForCustomer(@Param('customerId') customerId: string) {
    return this.companySubscriptionService.findActiveSubscriptionForCustomer(
      customerId,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanySubscriptionDto,
  ) {
    return this.companySubscriptionService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'MANAGER', 'CASHIER')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.companySubscriptionService.remove(id);
  }
}

// @Post('checkout-session')
// createCheckoutSession(
//   @Body() dto: { email: string; price_id: string; name?: string },
// ) {
//   return this.companySubscriptionService.createCheckoutSessionForCustomer(
//     dto,
//   );
// }
