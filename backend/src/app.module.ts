import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { validationSchema } from './config/env.validation';
import databaseConfig from './config/database.config';
import swaggerConfig from './config/swagger.config';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Common modules
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PrismaModule } from './common/prisma/prisma.module';

// Feature modules
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { SalesModule } from './modules/sales/sales.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ShiftsModule } from './modules/shifts/shifts.module';



@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [appConfig, databaseConfig, jwtConfig, swaggerConfig],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 req per minute globally
    }]),

    // Common modules
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    EmployeesModule,
    CategoriesModule,
    ProductsModule,
    StocksModule,
    SalesModule,
    VouchersModule,
    HealthModule,
    ReportsModule,
    ShiftsModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },

    // Global filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
