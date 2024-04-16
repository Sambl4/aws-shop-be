import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { formatJSONResponse } from '@libs/api-gateway';
import middy from '@middy/core';

import { SQSEvent } from 'aws-lambda';
import { putNewProduct } from 'src/db/product.service';
import { ProductsList } from 'src/types/api-types';

const region = 'eu-west-1';
const snsClient = new SNSClient({ region });

const catalogBatchProcess = async (event: SQSEvent) => {
  console.log('catalogBatchProcess event:', event);

  const products: ProductsList = event.Records.map(({ body }) => JSON.parse(body));

  await Promise.all(
    products.map(product => putNewProduct(product))
  )

  await snsClient.send(new PublishCommand({
    Subject: 'aws-test-shop-Products',
    Message: `A list of new items has been added to the store: \n ${products.map((product, ind) => `${ind + 1}: ${product.title}`).join(' \n')}`,
    TopicArn: process.env.SNSTopic_ARN,
  }))
};

export const main = middy(catalogBatchProcess);
