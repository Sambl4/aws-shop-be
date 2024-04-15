import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import schema from './schema';

const region = 'eu-west-1';
const bucket = 'aws-test-shop-import-bucket';
const folder = 'uploaded';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const params = {
      region,
      bucket,
      key: `${folder}/${event.queryStringParameters.name}`
    }

    const presignedUrl = await createPresignedUrlWithClient(params);

    return formatJSONResponse(presignedUrl);
  } catch (error) {
    formatJSONResponse(`Server error: ${error}`, 500);
  }
};

const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

export const main = middyfy(importProductsFile);
