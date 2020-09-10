import { DocumentBuilder } from '@nestjs/swagger';
export const swaggerOptions = new DocumentBuilder()
    .setTitle('API for Interlinkages core')
    .setDescription('API for Interlinkages core')
    .setVersion('1.0')
    .addTag('API for Interlinkages core')
    .build();
