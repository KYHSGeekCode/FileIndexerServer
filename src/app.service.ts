import { Inject, Injectable } from '@nestjs/common';
import { RecordDocument } from './documents/record.document';
import { CollectionReference } from '@google-cloud/firestore';

@Injectable()
export class AppService {
  constructor(
    @Inject(RecordDocument.collectionName)
    private recordCollection: CollectionReference<RecordDocument>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async create({ filename, tag, major_drive, minor_drive, path }) {
    const docRef = this.recordCollection.doc(filename);
    await docRef.set({
      filename,
      tag,
      major_drive,
      minor_drive,
      path,
    });
    const recordDoc = await docRef.get();
    const record = recordDoc.data();
    return record;
  }

  async findAll(): Promise<RecordDocument[]> {
    const snapshot = await this.recordCollection.get();
    const records: RecordDocument[] = [];
    snapshot.forEach((doc) => records.push(doc.data()));
    return records;
  }
}
