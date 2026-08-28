import { Exclude } from 'class-transformer';
import { Product } from 'src/modules/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { VariantSize } from 'src/modules/variantSIzes/entities/variantSizes.entity';
import { Color } from 'src/catalogues/colorProduct/entities/colorProduct.entity';

@Entity('tw_variant_product')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @Column("text", { array: true })
  image: string[];

  @Column('uuid')
  color_id: string;

  @Column('uuid')
  product_id: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Color, (color) => color.productVariants)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @OneToMany(() => VariantSize, (variantSize) => variantSize.variantProduct)
  variantSizes: VariantSize[];

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
