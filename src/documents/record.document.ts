export class RecordDocument {
  static collectionName = 'records';

  filename: string;
  tag: string;
  major_drive: string;
  minor_drive: string;
  path: string;
  nlp_parsed: string[];
}
