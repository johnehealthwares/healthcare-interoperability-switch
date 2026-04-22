import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesModule } from './modules';
import {
  ApplicationEntityEntity,
  RoutingTableEntity,
  StandardMappingEntity,
  MessageEventEntity,
  EventStreamEntity,
} from './modules/core/entities';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'health_interop_db',
      entities: [
        ApplicationEntityEntity,
        RoutingTableEntity,
        StandardMappingEntity,
        MessageEventEntity,
        EventStreamEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.DB_LOGGING === 'true',
    }),
    ModulesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
