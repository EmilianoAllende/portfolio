import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Membership } from '../../membership/entities/membership.entity';

@Entity({ name: 'tc_membership_type' })
export class MembershipType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'stripe_price_id', length: 255, unique: true })
  stripe_price_id: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp without time zone', nullable: true })
  deleted_at: Date;

  @OneToMany(() => Membership, (membership) => membership.type)
  membership: Membership[];
}
