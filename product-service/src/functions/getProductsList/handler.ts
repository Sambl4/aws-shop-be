import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getProducts } from 'src/db/product.service';
import { ProductsList } from 'src/types/api-types';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const products: ProductsList = await getProducts();

  return formatJSONResponse(products);
};

export const main = middyfy(getProductsList);
