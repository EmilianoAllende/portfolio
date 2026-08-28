import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

//import { InjectRepository } from '@nestjs/typeorm';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';
import { UpdateCancellationReasonDto } from './dto/update-cancellation-reason.dto';
import { InjectTenantRepository } from '../../common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class CancellationReasonService {
  constructor(
    @InjectTenantRepository(CancellationReason)
    private readonly CancellationReasonRepository: Repository<CancellationReason>,
  ) {}

  async create(
    createDto: CreateCancellationReasonDto,
  ): Promise<CancellationReason> {
    const cancel = this.CancellationReasonRepository.create({
      ...createDto,
      is_active: createDto.is_active ?? true,
    });
    return this.CancellationReasonRepository.save(cancel);
  }

  async findAll(): Promise<CancellationReason[]> {
    return this.CancellationReasonRepository.find({
      where: { is_active: true },
    });
  }

  async findOne(id: string): Promise<CancellationReason> {
    const CancellationReason = await this.CancellationReasonRepository.findOne({
      where: { id, is_active: true },
    });
    if (!CancellationReason)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    return CancellationReason;
  }

  async update(
    id: string,
    updateDto: UpdateCancellationReasonDto,
  ): Promise<{ message: string }> {
    const exists = await this.CancellationReasonRepository.findOne({
      where: { id, is_active: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.CancellationReasonRepository.update(id, updateDto);
    return { message: `Cancel reason with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.CancellationReasonRepository.findOne({
      where: { id, is_active: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.CancellationReasonRepository.update(id, { is_active: false });
    return { message: `Cancel reason with id ${id} deactivated successfully` };
  }
}
