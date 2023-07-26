import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAdminCoreModule } from './firebase/firebase.module';

export type FirebaseAdminModuleOptions = admin.AppOptions;

export interface FirebaseAdminModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useFactory?: (
    ...args: any[]
  ) => Promise<FirebaseAdminModuleOptions> | FirebaseAdminModuleOptions;
  inject?: any[];
}

@Module({})
export class FirebaseAdminModule {
  static forRoot(options: FirebaseAdminModuleOptions): DynamicModule {
    return {
      module: FirebaseAdminModule,
      imports: [FirebaseAdminCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: FirebaseAdminModuleAsyncOptions): DynamicModule {
    return {
      module: FirebaseAdminModule,
      imports: [FirebaseAdminCoreModule.forRootAsync(options)],
    };
  }
}
