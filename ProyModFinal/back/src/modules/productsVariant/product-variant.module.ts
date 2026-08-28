import { forwardRef, Module } from '@nestjs/common';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { Size } from '../../catalogues/sizeProduct/entities/size-product.entity';
import { Product } from '../products/entities/product.entity';
import { VariantSize } from '../variantSIzes/entities/variantSizes.entity';
import { Color } from 'src/catalogues/colorProduct/entities/colorProduct.entity';
import { VariantSizesService } from '../variantSIzes/variant-sizes.service';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TenantTypeOrmModule.forFeature([
      ProductVariant,
      Size,
      Color,
      Product,
      VariantSize,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, VariantSizesService],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
