// src/seeder/seed.ts
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Creamos un contexto de aplicación, no un servidor web completo
  const appContext = await NestFactory.createApplicationContext(SeederModule);

  const logger = appContext.get(Logger);
  const seeder = appContext.get(SeederService);

  try {
    await seeder.seed();
    logger.log('Seeding finalizado!', 'SeederScript');
  } catch (error) {
    logger.error(
      'Fallo en el proceso de seeding!',
      error.stack,
      'SeederScript',
    );
  } finally {
    // Cerramos la aplicación para que el script termine
    await appContext.close();
  }
}

bootstrap();
