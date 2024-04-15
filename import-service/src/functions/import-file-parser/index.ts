import { handlerPath } from '@libs/handler-resolver';

const bucket = 'aws-test-shop-import-bucket';
const folder = 'uploaded';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket,
        event: 's3:ObjectCreated:*',
        rules: [{
          prefix: folder,
        }],
        existing: true,
      }
    }
  ],
};
