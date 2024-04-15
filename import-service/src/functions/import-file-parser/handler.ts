import { formatJSONResponse } from '@libs/api-gateway';
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { S3Event, S3EventRecord } from 'aws-lambda/trigger/s3';
import { SQSClient, SendMessageCommand, SendMessageCommandInput, SendMessageCommandOutput, paginateListQueues } from '@aws-sdk/client-sqs';
import csv from 'csv-parser';
import middy from '@middy/core';


const region = 'eu-west-1';
const sourceFolder = 'uploaded';
const targetFolder = 'parsed';

const docClient = new S3Client({ region });
const sqsClient = new SQSClient({ region });

const importFileParser = async (event: S3Event) => {
  console.log('import file parser / sqs client',
    sqsClient.config.endpoint,
    sqsClient.config.region,
    sqsClient.config.runtime,
    sqsClient.config.defaultSigningName
)
  try {
    await Promise.all(
      event.Records.map(async (record: S3EventRecord) => {
        const row = await getRecord(record);
        await parseRow(row);
        await moveFile(record);
      })
    )

    return formatJSONResponse('result');
  } catch (error) {
    formatJSONResponse(`Server error: ${error}`, 500);
  } finally {
    docClient.destroy();
  }
};

const getRecord = async (record: S3EventRecord) => {
  const params: GetObjectCommandInput = {
    Bucket: record.s3.bucket.name,
    Key: record.s3.object.key,
  }

  try {
    const data: GetObjectCommandOutput = await docClient.send(new GetObjectCommand(params));

    return data.Body;
  } catch (err) {
    console.log(err);
  }
}

const parseRow = async (row: NodeJS.ReadableStream) => {
  await new Promise((resolve, reject) => {
    row
    .pipe(csv())
    .on('data', async (data) => {
      const params: SendMessageCommandInput = {
        QueueUrl: process.env.SQS_URL,
        MessageBody: JSON.stringify(data)
      }

      const response = await sqsClient.send(new SendMessageCommand(params));
      console.log('SendMessageCommand to SQS', response);
    })
    .on('error', (error) => {
      console.log(error)
      return reject;
    })
    .on('end', resolve)
  })
}

const moveFile = async (record: S3EventRecord): Promise<void> => {
  const key = record.s3.object.key;
  const bucket = record.s3.bucket.name;

  const copyPath: string = key.replace(sourceFolder, targetFolder);
  const copyCommand: CopyObjectCommand = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${ bucket }/${ key }`,
    Key: copyPath,
  });

  await docClient.send(copyCommand);

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await docClient.send(deleteCommand);
  console.log(`File ${ key } moved from ${ bucket }/${ key } to ${ bucket }/${ copyPath }`);
};
export const main = middy(importFileParser);
