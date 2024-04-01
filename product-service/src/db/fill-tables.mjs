import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const batchSize = 10;

const fillTables = async () => {
  const ddbClient = new DynamoDBClient({region: 'eu-west-1'});
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const productsBatch = [...new Array(batchSize)].map((_product, index) => createProduct(index + 1));
  const stocksBatch = productsBatch.map((product) => createStock(product.id));

  publishData(docClient, 'aws-test-shop-Products', productsBatch);
  publishData(docClient, 'aws-test-shop-Stocks', stocksBatch);
}

const createProduct = (index) => {
  return {
    description: `Product ${index} description`,
    id: uuidv4(),
    price: getRandom(20, 100),
    title: `Product ${index}`,
  };
}

const createStock = (product_id) => {
  console.log(product_id);

   return {
    product_id,
    count: getRandom(1, 50)
   };
}

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const publishData = async (docClient, tableName, data) => {
  const putCommands = data.map(item => {
    return new PutCommand({
      TableName: tableName,
      Item: item,
    });
  });

  const promises = putCommands.map(command => docClient.send(command));

  await Promise.all(promises);
}

fillTables();
