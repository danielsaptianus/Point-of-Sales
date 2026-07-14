import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Health')
@Controller({
  version: VERSION_NEUTRAL,
})
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Root API endpoint' })
  root() {
    return { status: 'ok', message: 'Welcome to project-2026-06-arto-be API' };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Simple health check' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  ping() {
    return { message: 'pong' };
  }
}
