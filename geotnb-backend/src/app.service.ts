import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello TNB Géoportail API! 🏛️';
  }

  getStatus(): any {
    return {
      status: 'active',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}