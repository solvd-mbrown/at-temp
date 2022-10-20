import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  FirebaseAdminModuleAsyncOptions,
  FirebaseAdminModuleOptions,
} from '../auth.module';
import { FirebaseAuthenticationService } from '../auth.service';

import { FIREBASE_ADMIN_MODULE_OPTIONS } from './firebase.constants';

const PROVIDERS = [FirebaseAuthenticationService];
const EXPORTS = [...PROVIDERS];

@Global()
@Module({})
export class FirebaseAdminCoreModule {
  static forRoot(options: FirebaseAdminModuleOptions): DynamicModule {
    const firebaseAdminModuleOptions = {
      provide: FIREBASE_ADMIN_MODULE_OPTIONS,
      useValue: options,
    };

    const app =
      admin.apps.length === 0 ? admin.initializeApp(options) : admin.apps[0];

    const providers = this.createProviders(options);

    return {
      module: FirebaseAdminCoreModule,
      providers: [firebaseAdminModuleOptions, ...providers],
      exports: [...EXPORTS],
    };
  }

  private static createProviders(
    config: FirebaseAdminModuleOptions,
  ): Provider<any>[] {
    return PROVIDERS.map<Provider>((ProviderService) => ({
      provide: ProviderService,
      useFactory: () => new ProviderService(config),
    }));
  }

  static forRootAsync(options: FirebaseAdminModuleAsyncOptions): DynamicModule {
    const firebaseAdminModuleOptions = {
      provide: FIREBASE_ADMIN_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const providers = this.createAsyncProviders();

    return {
      module: FirebaseAdminCoreModule,
      imports: options.imports,
      providers: [firebaseAdminModuleOptions, ...providers],
      exports: [...EXPORTS],
    };
  }

  public static createAsyncProviders(): Provider<any>[] {
    return PROVIDERS.map<Provider>((ProviderService) => ({
      provide: ProviderService,
      useFactory: (options: FirebaseAdminModuleOptions) => {
        return new ProviderService(options);
      },
      inject: [FIREBASE_ADMIN_MODULE_OPTIONS],
    }));
  }
}
