import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: 'GET',
        path: '/product/{productId}',
        responses: {
          200: {
            description: 'Successful API Response',
            bodyType: 'IProduct',
          },
          404: {
            description: 'Product ID not found',
            bodyType: 'string',
          },
          500: 'Server error',
        },
      },
    },
  ],
};
