import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DeleteCommandOutput, DynamoDBDocumentClient, GetCommand, GetCommandInput, GetCommandOutput, PutCommand, PutCommandInput, PutCommandOutput, QueryCommand, ScanCommandInput, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// TODO: use env vars instead of {region: 'eu-west-1'}
const ddbClient: DynamoDBClient = new DynamoDBClient({region: 'eu-west-1'});
const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME_TO_PRIMARY_KEY_MAP = new Map<string, string>()
  .set('aws-test-shop-Products', 'id')
  .set('aws-test-shop-Stocks', 'product_id');

export const getTableData = async (tableName: string): Promise<Record<string, any>> => {
  const params: ScanCommandInput = {
    TableName: tableName,
  }

  try {
    const data: ScanCommandOutput = await docClient.send(new ScanCommand(params));

    return data.Items.map(i => unmarshall(i));
  } catch (err) {
    console.log(err);
  }
}

const getByQuery = async () => {
  const params = {
    TableName: 'aws-test-shop-Products',
    Key: marshall({ id: '7567ec4b-b10c-48c5-9445-fc73c48a80a2' }),
    ExpressionAttributeValues: {
      ':id': {
        'S': '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
      }
    },
    KeyConditionExpression: "id = :id",
  }
  try {
    const data = await docClient.send(new QueryCommand(params));
    console.log(unmarshall(data.Items[0]));
  } catch (err) {
    console.log(err);
  }
}

export const getItemById = async (tableName: string, id: string): Promise<Record<string, any>> => {
  const primaryKey: string = TABLE_NAME_TO_PRIMARY_KEY_MAP.get(tableName);

  const params: GetCommandInput = {
    TableName: tableName,
    Key: { [`${primaryKey}`]: id },
  }

  try {
    const data: GetCommandOutput = await docClient.send(new GetCommand(params));

    return data.Item;
  } catch (err) {
    console.log(err);
  }
}

export const putProduct = async (tableName: string, item: any): Promise<number> => {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: item
  }

  try {
    const data: PutCommandOutput = await docClient.send(new PutCommand(params));

    return data.$metadata.httpStatusCode;
  } catch (err) {
    console.log(err);
  }
}

const deleteItem = async (tableName: string, id: string): Promise<number> => {
  const primaryKey: string = TABLE_NAME_TO_PRIMARY_KEY_MAP.get(tableName);

  const command: DeleteCommand = new DeleteCommand({
    TableName: tableName,
    Key: { [`${primaryKey}`]: id },
  });

  const response: DeleteCommandOutput = await docClient.send(command);
  return response.$metadata.httpStatusCode;
}
