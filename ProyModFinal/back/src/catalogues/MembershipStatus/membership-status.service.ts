import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MembershipStatus } from './entities/membership-status.entity';
import { CreateMembershipStatusDto } from './dto/create-membership-status.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';
//import { InjectRepository } from '@nestjs/typeorm';
import { InjectTenantRepository } from 'src/common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class MembershipStatusService {
  constructor(
    @InjectTenantRepository(MembershipStatus)
    private readonly membershipStatusRepo: Repository<MembershipStatus>,
  ) {}

  async create(
    createDto: CreateMembershipStatusDto,
  ): Promise<MembershipStatus> {
    const userMemStatus = this.membershipStatusRepo.create({
      ...createDto,
      is_active: createDto.is_active ?? true,
    });
    return this.membershipStatusRepo.save(userMemStatus);
  }

  async findAll(): Promise<MembershipStatus[]> {
    return this.membershipStatusRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<MembershipStatus> {
    const userMemStatus = await this.membershipStatusRepo.findOne({
      where: { id, is_active: true },
    });
    if (!userMemStatus)
      throw new NotFoundException(`MembershipStatus with id ${id} not found`);
    return userMemStatus;
  }

  async update(
    id: string,
    updateDto: UpdateMembershipStatusDto,
  ): Promise<{ message: string }> {
    const exists = await this.membershipStatusRepo.findOne({
      where: { id, is_active: true },
    });
    if (!exists)
      throw new NotFoundException(`MembershipStatus with id ${id} not found`);
    await this.membershipStatusRepo.update(id, updateDto);
    return { message: `MembershipStatus with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.membershipStatusRepo.findOne({
      where: { id, is_active: true },
    });
    if (!exists)
      throw new NotFoundException(`MembershipStatus with id ${id} not found`);
    await this.membershipStatusRepo.update(id, { is_active: false });
    return {
      message: `MembershipStatus with id ${id} deactivated successfully`,
    };
  }
}
