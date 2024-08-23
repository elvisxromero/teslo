import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Boostrap')
  app.setGlobalPrefix('api'); // Le agrego un prefijo a mi API

  app.useGlobalPipes( // Validacon para entradas de la API
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(process.env.PORT);
  logger.log(`App corriendo en ${process.env.PORT}`)
}
bootstrap();
