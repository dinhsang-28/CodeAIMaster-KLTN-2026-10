import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configservice = app.get(ConfigService);
  const port = configservice.get('PORT') || 3000;
  // const port = process.env.PORT || 3000;
  // validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true
  }))
  // cookie
  app.use(cookieParser());
  // day la api luon co duoi : vd: api/v1/login
  app.setGlobalPrefix('api/v1',{exclude:['']});
  // config cors
  app.enableCors(
    {
      "origin":true,
      "methods":"GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue":false,
      credentials:true
    }
  )
//   app.enableCors({
//   origin: [
//     'https://code-ai-master-kltn-2026-10.vercel.app', // frontend production
//     'http://localhost:5173', // local dev
//     'http://localhost:3000',
//   ],
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
// });
  await app.listen(port);
}
bootstrap();
