import { Global, Module } from '@nestjs/common';
import { AppConfig } from './app-config';
import { validateEnv } from './env.schema';
import { loadEnvFiles } from './load-env-files';

@Global()
@Module({
  providers: [
    {
      provide: AppConfig,
      useFactory: () => {
        loadEnvFiles();
        return new AppConfig(validateEnv(process.env));
      },
    },
  ],
  exports: [AppConfig],
})
export class AppConfigModule {}
