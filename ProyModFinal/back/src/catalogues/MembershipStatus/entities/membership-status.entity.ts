import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_membership_status')
export class MembershipStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  membership_status: string; //! active- cancelled - expired - past-due??

  @Column({ default: true })
  is_active: boolean;
}
