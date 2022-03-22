import { Inject, Injectable, Logger } from '@nestjs/common';
import { RecordDocument } from './documents/record.document';
import { BulkWriter, CollectionReference } from '@google-cloud/firestore';
import WordsNinjaPack = require('wordsninja');
import { FirestoreBulkWriterProvider } from './firestore/firestore.providers';

const WordsNinja = new WordsNinjaPack();

@Injectable()
export class AppService {
  constructor(
    @Inject(RecordDocument.collectionName)
    private recordCollection: CollectionReference<RecordDocument>,
    @Inject(FirestoreBulkWriterProvider)
    private bulkWriter: BulkWriter,
  ) {}

  private async processFilename(filename: string) {
    // underscore, cammelcase, space
    const parsed = filename
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([0-9])([^0-9])/g, '$1 $2')
      .replace(/([^0-9])([0-9])/g, '$1 $2')
      .replace(/([^a-zA-Z])([a-zA-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])([^a-zA-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[\s,_.()-=+/@]+/);
    await WordsNinja.loadDictionary(); // First load dictionary
    const nlp_parsed = await Promise.all(
      parsed.flatMap((word) => {
        return WordsNinja.splitSentence(word) ?? [word];
      }),
    );
    Logger.log(parsed);
    return nlp_parsed;
  }

  async create({ filename, tag, major_drive, minor_drive, path }) {
    const docRef = this.recordCollection.doc(filename);
    const nlp_parsed = await this.processFilename(filename);
    await docRef.set({
      filename,
      tag,
      major_drive,
      minor_drive,
      path,
      nlp_parsed,
    });
    const recordDoc = await docRef.get();
    return recordDoc.data();
  }

  async bulk_create(
    records: { filename; tag; major_drive; minor_drive; path }[],
  ) {
    for (const record of records) {
      const docRef = this.recordCollection.doc(record.filename);
      const nlp_parsed = await this.processFilename(record.filename);
      Logger.log('Will wait');
      this.bulkWriter.create(docRef, {
        ...record,
        nlp_parsed,
      });
      Logger.log('wait done');
    }
    await this.bulkWriter.close().then(() => {
      Logger.log('executed all writes');
    });
  }

  async findAll(): Promise<RecordDocument[]> {
    const snapshot = await this.recordCollection.get();
    const records: RecordDocument[] = [];
    snapshot.forEach((doc) => records.push(doc.data()));
    return records;
  }

  async findByNameContaining(
    query: string,
    cursor: string,
  ): Promise<RecordDocument[]> {
    Logger.log('query', query, 'cursor', cursor);
    const snapshot = await this.recordCollection
      .where('filename', '>=', query)
      .where('filename', '<=', query + '~')
      // .startAfter(cursor)
      .limit(50)
      .get();
    const records: RecordDocument[] = [];
    snapshot.forEach((doc) => {
      const document = doc.data() as RecordDocument;
      records.push(document);
    });
    return records;
  }
}
