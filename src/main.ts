import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter())

  const port = process.env.PORT || 8090;
  await app.listen(port);

  console.log(`Healthcare Interoperability Switch Platform listening on port ${port}`);
}

bootstrap();
