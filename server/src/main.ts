import type { LogLevel } from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { GlobalConfig } from '@/config'

import { AppModule } from './app.module'

async function bootstrap() {
  // 日志
  const logLevels: LogLevel[] = GlobalConfig.IS_PROD
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'verbose', 'debug']

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: logLevels
  })

  // 全局管道
  app.useGlobalPipes(new ValidationPipe())

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Dolphin Admin API')
    .setDescription('Dolphin Admin 后台管理系统的接口文档，基于 Nest.js。')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [] // TODO: 导出额外的模型，例如：分页、请求
  })

  /**
   * 文档地址为 /api
   * 例如：http://localhost:3000/api
   * Swagger JSON 地址为 /api-json
   * 例如：http://localhost:3000/api-json
   */
  SwaggerModule.setup('api', app, document)

  await app.listen(4061)
}
bootstrap()
