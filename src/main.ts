import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const main = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: 'http://localhost:3000' });
  await app.listen(process.env.PORT ?? 5000);
};

main();
