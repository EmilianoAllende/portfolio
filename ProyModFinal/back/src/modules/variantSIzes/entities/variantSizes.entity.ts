import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Size } from '../../../catalogues/sizeProduct/entities/size-product.entity';
import { ProductVariant } from '../../productsVariant/entities/product-variant.entity';
import { Exclude } from 'class-transformer';

@Entity('tw_variant_sizes')
export class VariantSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  stock: number;

  @Column('uuid')
  size_id: string

  @ManyToOne(() => Size, (size) => size.variantSizes)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @Column('uuid')
  variant_product_id: string;

  @ManyToOne(() => ProductVariant, (variantProduct) => variantProduct.variantSizes)
  @JoinColumn({ name: 'variant_product_id' })
  variantProduct: ProductVariant;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;
  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deleted_at: Date;
}
