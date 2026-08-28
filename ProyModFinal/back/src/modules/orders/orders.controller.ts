import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateCancellationDto } from '../cancellation/dto/create-cancellation.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Employee } from '../users/entities/employee.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.processNewOrder(createOrderDto);
  }

  @Get('my') // NACHO
  @UseGuards(AuthGuard('jwt'))
  getMyOrders(@GetUser() employee: Employee) {
    return this.ordersService.findByEmployee(employee.id);
  }

  @Get(':id')
  findOrderById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOneById(id);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCancellationDto: CreateCancellationDto,
    @GetUser() employee: Employee,
  ) {
    if (!employee) {
      throw new UnauthorizedException(
        'No se pudo identificar al empleado en la sesión.',
      );
    }

    return this.ordersService.cancelOrder(
      id,
      employee.id,
      createCancellationDto,
    );
  }
}
