import {NestFactory} from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {AppModule} from './app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
            cors: true,
    });

    // Serve static files
    const serveStaticOptions = {
        rootPath: join(__dirname, '..', 'public'),
    };
    ServeStaticModule.forRoot(serveStaticOptions);

    const config = new DocumentBuilder()
        .setTitle('Tree API')
        .setDescription('Arr-Tree API Documentation')
        .setVersion('0.1')
        .addTag('tree')
        .addTag('user')
        .addTag('comment')
        .addTag('post')
        .addTag('file')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);

    writeFileSync(join(__dirname, '..', 'public', 'swagger-spec.json'), JSON.stringify(document, null, 2));

    SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
    console.log(`Application is up and running on ${await app.getUrl()}`);
}


bootstrap();
