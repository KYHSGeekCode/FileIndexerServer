import { Module, DynamicModule } from '@nestjs/common';
import { Firestore, Settings } from '@google-cloud/firestore';
import {
  FirestoreDatabaseProvider,
  FirestoreOptionsProvider,
  FirestoreCollectionProviders,
  FirestoreBulkWriterProvider,
} from './firestore.providers';

type FirestoreModuleOptions = {
  imports: any[];
  useFactory: (...args: any[]) => Settings;
  inject: any[];
};

@Module({})
export class FirestoreModule {
  static forRoot(options: FirestoreModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: FirestoreOptionsProvider,
      useFactory: options.useFactory,
      inject: options.inject,
    };
    const dbProvider = {
      provide: FirestoreDatabaseProvider,
      useFactory: (config) => new Firestore(config),
      inject: [FirestoreOptionsProvider],
    };
    const collectionProviders = FirestoreCollectionProviders.map(
      (providerName) => ({
        provide: providerName,
        useFactory: (db) => db.collection(providerName),
        inject: [FirestoreDatabaseProvider],
      }),
    );
    const bulkWriterProviders = {
      provide: FirestoreBulkWriterProvider,
      useFactory: (db) => db.bulkWriter(),
      inject: [FirestoreDatabaseProvider],
    };
    return {
      global: true,
      module: FirestoreModule,
      imports: options.imports,
      providers: [
        optionsProvider,
        dbProvider,
        bulkWriterProviders,
        ...collectionProviders,
      ],
      exports: [dbProvider, bulkWriterProviders, ...collectionProviders],
    };
  }
}
