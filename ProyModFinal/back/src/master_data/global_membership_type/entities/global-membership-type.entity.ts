import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CompanySubscription } from '../../company_subscription/entities/company-subscription.entity'; // Asegúrate de que esta ruta sea correcta

@Entity('global_membership_types')
export class GlobalMembershipType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  //? PREGUNTAR : esto lo modifique para que referencie el price id de stripe, es necesario tambien el price para mostrar el valor?
  @Column({ name: 'stripe_price_id', length: 255, unique: true })
  stripe_price_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'features_json', type: 'jsonb', nullable: true })
  features_json: Record<string, any>;

  @OneToMany(
    () => CompanySubscription,
    (subscription) => subscription.membership_typeid,
  )
  subscriptions: CompanySubscription[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp without time zone',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
