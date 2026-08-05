import { Controller, Get, VERSION_NEUTRAL, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

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
  @Get('pos')
  @Header('Content-Type', 'text/html')
  @ApiOperation({ summary: 'POS Testing HTML interface' })
  pos() {
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      return fs.readFileSync(htmlPath, 'utf8');
    }
    return `<h1>index.html not found in public folder</h1>`;
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
