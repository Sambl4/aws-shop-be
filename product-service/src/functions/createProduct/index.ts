import { handlerPath } from '@libs/handler-resolver';
import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: 'POST',
        path: '/products',
        request: {
          schema: {
            'application/json': schema,
          }
        },
        responses: {
          200: {
            description: 'Successful API Response',
            bodyType: 'IProduct',
          },
          500: 'Server error',
        },
      },
    },
  ],
};
