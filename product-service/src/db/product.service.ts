import { IProduct, IStock, ProductsList, StockList } from 'src/types/api-types';
import { getItemById, getTableData, putProduct } from './ddb-client.service';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (): Promise<ProductsList> => {
  const products = await getTableData('aws-test-shop-Products') as ProductsList;
  const stocks = await getTableData('aws-test-shop-Stocks') as StockList;

  return joinStocksWithProducts(products, stocks);
}

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await getItemById('aws-test-shop-Products', id) as IProduct;
  const stock = await getItemById('aws-test-shop-Stocks', id) as IStock;

  return {
    ...product,
    count: stock.count,
  };
}

export const putNewProduct = async(item: IProduct) => {
  const id: string = uuidv4();
  const product = {
    description: item.description,
    price: item.price,
    title: item.title,
    id,
  }
  const stock = {
    product_id: id,
    count: item.count,
  }

  return await Promise.all([
    putProduct('aws-test-shop-Products', product),
    putProduct('aws-test-shop-Stocks', stock),
  ]);
}

const joinStocksWithProducts = (products: ProductsList, stocks: StockList): ProductsList => {
  return products.map(product => {
    return {
      ...product,
      count: stocks.find(stock => stock.product_id === product.id).count,
    }
  });
}
