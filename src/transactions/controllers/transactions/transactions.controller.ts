import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  ReqCreateTransactionDto,
  ReqCreateTransferDto,
} from 'src/transactions/dto/create-transaction.dto';
import Transaction from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/services/transactions/transactions.service';
import { UsersService } from 'src/users/services/users/users.service';
import {
  genDebitDesc,
  genTopUpDesc,
  genTransferFromDesc,
  genTransferToDesc,
} from 'src/utils/transaction-desc';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('top-up')
  async createTopUp(
    @Req() req: FastifyRequest,
    @Body() dto: ReqCreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create({
      userId: req.user.id,
      type: 'top-up',
      desc: genTopUpDesc(dto.value),
      value: dto.value,
    });
  }

  @Post('debit')
  async createDebit(
    @Req() req: FastifyRequest,
    @Body() dto: ReqCreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create({
      userId: req.user.id,
      type: 'debit',
      desc: genDebitDesc(dto.value),
      value: -dto.value,
    });
  }

  @Post('transfer')
  async createTransfer(
    @Req() req: FastifyRequest,
    @Body() dto: ReqCreateTransferDto,
  ): Promise<Transaction> {
    const from = await this.usersService.findById(req.user.id);
    const to = await this.usersService.findById(dto.toId);

    const tr = await this.transactionsService.create({
      desc: genTransferToDesc(dto.value, to.name),
      userId: req.user.id,
      type: 'transfer',
      value: -dto.value,
    });

    await this.transactionsService.create({
      desc: genTransferFromDesc(dto.value, from.name),
      userId: dto.toId,
      type: 'transfer',
      value: dto.value,
    });

    return tr;
  }

  @Get()
  async getAllByUser(@Req() req: FastifyRequest): Promise<Transaction[]> {
    return this.transactionsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  async getById(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Transaction> {
    return this.transactionsService.findById(id, req.user.id);
  }
}