import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Employee } from 'src/modules/users/entities/employee.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Employee => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
//? PREGUNTAR : creacion de decorador para  la IA me dijo q esta opcion era mejor y mas escalable (y profesional)
//FIXME VER si se cambia o no
