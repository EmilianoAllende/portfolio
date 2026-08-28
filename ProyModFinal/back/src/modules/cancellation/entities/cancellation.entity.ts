import { CancellationReason } from 'src/catalogues/cancellationReason/entities/cancellation-reason.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Employee } from 'src/modules/users/entities/employee.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'tw_cancellations' })
export class Cancellation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  cancellation_comment: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => Order, (order) => order.cancellation)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Employee, (employee) => employee.cancellation)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => CancellationReason, (reason) => reason.cancellation)
  @JoinColumn({ name: 'cancellation_reason_id' })
  cancellationReason: CancellationReason;
}
