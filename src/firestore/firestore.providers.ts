import { RecordDocument } from '../documents/record.document';

export const FirestoreDatabaseProvider = 'firestoredb';
export const FirestoreOptionsProvider = 'firestoreOptions';
export const FirestoreBulkWriterProvider = 'firestoreBulkWriter';
export const FirestoreCollectionProviders: string[] = [
  RecordDocument.collectionName,
];
