export interface IProduct {
  description: string;
  id?: string;
  price: number;
  title: string;
  count: number;
}

export type ProductsList = IProduct[];

export interface IStock {
  product_id: string;
  count: number;
}

export type StockList = IStock[];
