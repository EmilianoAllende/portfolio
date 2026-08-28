import { Cancellation } from '../../../modules/cancellation/entities/cancellation.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('tc_cancel_reason')
export class CancellationReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(
    () => Cancellation,
    (cancellation) => cancellation.cancellationReason,
  )
  cancellation: Cancellation[];
}
