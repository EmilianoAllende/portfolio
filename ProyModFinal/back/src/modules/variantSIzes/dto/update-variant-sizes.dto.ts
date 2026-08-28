import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantSizeDto } from './create-variant-sizes.dto';

export class UpdateVariantSizeDto extends PartialType(CreateVariantSizeDto) {}
