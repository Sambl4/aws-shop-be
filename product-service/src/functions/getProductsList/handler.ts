import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getProducts } from 'src/db/product.service';
import { Product } from 'src/models/Product';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const products: Product[] = await getProducts();

  return formatJSONResponse(products);
};

export const main = middyfy(getProductsList);
