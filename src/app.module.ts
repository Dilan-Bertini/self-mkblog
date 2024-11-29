import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './core/configuration/config';
import { CoreModule } from './core/core.module';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        load: [config]
      }
    ),
    RestModule,
    CoreModule,
  ],
})
export class AppModule { }
