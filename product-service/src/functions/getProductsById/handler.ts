import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getProductById } from 'src/db/product.service';
import { IProduct } from 'src/types/api-types';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const productId: string = event.pathParameters.productId;
  const product: IProduct = await getProductById(productId);

  return product ? formatJSONResponse([product]) : formatJSONResponse(`Product ${productId} not found`, 404);
};

export const main = middyfy(getProductsById);
