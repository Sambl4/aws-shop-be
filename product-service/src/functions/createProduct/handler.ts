import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { putNewProduct } from 'src/db/product.service';
import { IProduct } from 'src/types/api-types';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('createProduct event:', event);

  try {
    console.log(event);

    const product: IProduct = event.body;

    const response = await putNewProduct(product);

    console.log(response)
    return formatJSONResponse(response.toString());
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

export const main = middyfy(createProduct);
