import { Module } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { usersRepository } from './repository/users.repository';

@Module({
  providers: [UsersService, usersRepository],
  exports: [UsersService],
})
export class UsersModule {}
