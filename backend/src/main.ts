import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
  RequestMethod,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Get configurations
  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  const swaggerPath = configService.get<string>('swagger.path');
  const apiPrefix = configService.get<string>('app.apiPrefix');
  const port = configService.get<number>('app.port');

  const rawCorsOrigin = configService.get<string>('app.corsOrigin');
  const corsOrigin = rawCorsOrigin && rawCorsOrigin.includes(',') 
    ? rawCorsOrigin.split(',').map(o => o.trim()) 
    : rawCorsOrigin;

  // Enable CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Enable Helmet for security headers
  app.use(helmet());

  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix(apiPrefix, {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'ping', method: RequestMethod.GET },
      { path: 'pos', method: RequestMethod.GET },
      { path: '', method: RequestMethod.GET },
    ],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Class serializer for excluding fields (like password)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger Documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('project-2026-06-arto-be API')
      .setDescription('project-2026-06-arto-be Backend API Documentation')
      .setVersion('1.0')
      .addCookieAuth('Authentication', {
        type: 'apiKey',
        in: 'cookie',
        name: 'Authentication',
        description: 'JWT token in cookie',
      })
      .addTag('Authentication', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Employees', 'Employee management endpoints')
      .addTag('Categories', 'Category management endpoints')
      .addTag('Products', 'Product management endpoints')
      .addTag('Stocks', 'Stock management endpoints')
      .addTag('Sales', 'Sales transaction endpoints')
      .addTag('Health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      useGlobalPrefix: true,
      swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: -1,
      },
    });
  }

  await app.listen(port);

  console.log(`\nApplication is running on: http://localhost:${port}/`);
  console.log(`Environment: ${configService.get<string>('app.env')}\n`);
  if (swaggerEnabled) {
    console.log(`Swagger Documentaion on : http://localhost:${port}/api/${swaggerPath}`);
  }
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Ping endpoint: http://localhost:${port}/ping\n`);
}

bootstrap();
// Trigger restart
