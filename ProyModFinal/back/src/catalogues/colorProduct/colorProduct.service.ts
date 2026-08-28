import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { Color } from './entities/colorProduct.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { instanceToPlain } from 'class-transformer';
import { InjectTenantRepository } from 'src/common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class ColorService {
  constructor(
    @InjectTenantRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async create(createDto: CreateColorDto) {
    const deletedColor = await this.colorRepository.findOne({
      where: { color: createDto.color, deleted_at: Not(IsNull()) },
      withDeleted: true,
    });

    if (deletedColor) {
      await this.colorRepository.recover(deletedColor);
      return instanceToPlain(deletedColor);
    }

    const deletedHexCode = await this.colorRepository.findOne({
      where: { hexCode: createDto.hexCode, deleted_at: Not(IsNull()) },
      withDeleted: true,
    });

    if (deletedHexCode) {
      await this.colorRepository.recover(deletedHexCode);
      return instanceToPlain(deletedHexCode);
    }
    const [activeColor, activeHexCode] = await Promise.all([
      this.colorRepository.findOne({
        where: { color: createDto.color, deleted_at: IsNull() },
      }),
      this.colorRepository.findOne({
        where: { hexCode: createDto.hexCode, deleted_at: IsNull() },
      }),
    ]);

    if (activeColor) {
      throw new BadRequestException(
        `Color already exists with color: ${createDto.color}`,
      );
    }

    if (activeHexCode) {
      throw new BadRequestException(
        `Color already exists with hexCode: ${createDto.hexCode}`,
      );
    }

    const color = this.colorRepository.create(createDto);
    const saved = await this.colorRepository.save(color);
    return instanceToPlain(saved);
  }

  async findAll() {
    const data = await this.colorRepository.find();
    return instanceToPlain(data);
  }

  async findOne(id: string) {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);
    return instanceToPlain(color);
  }

  async update(id: string, updateDto: UpdateColorDto) {
    const color = await this.colorRepository.findOneBy({ id });
    if (!color) {
      throw new NotFoundException(`Color with id ${id} not found`);
    }

    if (updateDto.color || updateDto.hexCode) {
      const duplicate = await this.colorRepository.findOne({
        where: [
          { color: updateDto.color ?? '', id: Not(id) },
          { hexCode: updateDto.hexCode ?? '', id: Not(id) },
        ],
      });

      if (duplicate) {
        const conflictField =
          duplicate.color === updateDto.color ? 'color' : 'hexCode';
        const conflictValue =
          conflictField === 'color' ? updateDto.color : updateDto.hexCode;

        throw new BadRequestException(
          `Color already exists with ${conflictField}: ${conflictValue}`,
        );
      }
    }

    const updated = this.colorRepository.merge(color, updateDto);
    const saved = await this.colorRepository.save(updated);
    return instanceToPlain(saved);
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.colorRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!exists) throw new NotFoundException(`Color with id ${id} not found`);
    await this.colorRepository.softDelete(id);
    return { message: `Color with id ${id} deleted successfully` };
  }
}
