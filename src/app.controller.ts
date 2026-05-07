import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date() };
  }

  @Get('/v1/info')
  info() {
    return {
      service: 'Healthcare Transaction Switching Platform',
      version: '1.0.0',
      modules: ['AE', 'Routing', 'Mapping', 'Event'],
    };
  }
}
