import { Injectable, NotFoundException } from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { InjectTenantRepository } from '../../../common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectTenantRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  findAll(): Promise<Membership[]> {
    return this.membershipRepository.find({
      relations: {
        type: true,
        status: true,
        client: { user: true },
      },
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: {
        type: true,
        status: true,
        client: { user: true },
      },
    });
    if (!membership) {
      throw new NotFoundException(`Membership con ID "${id}" no encontrada.`);
    }
    return membership;
  }
}
