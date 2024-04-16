import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 5,
        arn: 'arn:aws:sqs:eu-west-1:211125737928:aws-test-shop-sqs-queue'
      }
    },
  ],
};
