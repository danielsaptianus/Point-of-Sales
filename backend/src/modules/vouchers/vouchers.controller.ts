import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './core/dto/create-voucher.dto';
import { UpdateVoucherDto } from './core/dto/update-voucher.dto';
import { ValidateVoucherDto } from './core/dto/validate-voucher.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('vouchers')
@Controller('api/v1/vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new voucher (Admin)' })
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Post('validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate and calculate voucher discount' })
  validate(@Body() validateVoucherDto: ValidateVoucherDto) {
    return this.vouchersService.validateAndCalculateVoucher(validateVoucherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vouchers' })
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get voucher by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update voucher' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete voucher' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.remove(id);
  }
}
