import { formatJSONResponse } from '@libs/api-gateway';
import { GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { S3Event, S3EventRecord } from 'aws-lambda/trigger/s3';
import * as csv from 'csv-parser';
import { resolve } from 'path';
import middy from '@middy/core';


const region = 'eu-west-1';
const bucket = 'aws-test-shop-import-bucket';
const folder = 'uploaded';

const docClient = new S3Client({ region });

const importFileParser = async (event: S3Event) => {
  const result = [];
  console.log('importFileParser', event.Records);
  try {
    event.Records.forEach((record: S3EventRecord, ind: number) =>
    getRecord(record, ind)
      .then(row => parseRow(row))
      .then(res => result.push(res))
    )

    return formatJSONResponse(result);
  } catch (error) {
    formatJSONResponse(`Server error: ${error}`, 500);
  }
};

const getRecord = async (record: S3EventRecord, ind: number) => {
  const params: GetObjectCommandInput = {
    Bucket: record.s3.bucket.name,
    Key: record.s3.object.key,
  }

  try {
    const data: GetObjectCommandOutput = await docClient.send(new GetObjectCommand(params));
    console.log(`getRecord ${ind}: `, data);
    return data;
  } catch (err) {
    console.log(err);
  }
}

const parseRow = async (row: GetObjectCommandOutput) => {
  await new Promise((resolve, reject) => {
    row.Body
    .pipe(csv())
    .on('data', (data) => console.log('parseRow:', data))
    .on('end', () => resolve)
  })
}

export const main = middy(importFileParser);
