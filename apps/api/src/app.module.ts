import { Module } from '@nestjs/common';
import { HttpModule } from '@api/infra/http/http.module';

@Module({
  imports: [
    HttpModule
  ]
})
export class AppModule { }
