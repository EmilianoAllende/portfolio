import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySubscriptionService } from './company-subscription.service';
import { CompanySubscriptionController } from './company-subscription.controller';
import { CompanySubscription } from './entities/company-subscription.entity';
import { GlobalMembershipType } from '../global_membership_type/entities/global-membership-type.entity';
import { StripeModule } from 'src/modules/stripe/stripe.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [CompanySubscription, GlobalMembershipType],
      'masterConnection',
    ),
    forwardRef(() => StripeModule),
    CustomerModule,
  ], //! Especificar la conexión
  providers: [CompanySubscriptionService],
  controllers: [CompanySubscriptionController],
  exports: [CompanySubscriptionService],
})
export class CompanySubscriptionModule {}
