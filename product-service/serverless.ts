import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-esbuild',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    httpApi: {
      cors: {
        allowedMethods: ['GET', 'POST', 'PUT'],
        allowedOrigins: [
          'http://localhost:5173',
          'https://d2exfjxf8vormv.cloudfront.net',
        ],
      }
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamManagedPolicies: ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
  },
  functions: {
    createProduct,
    getProductsList,
    getProductsById,
  },
  package: { individually: true },
  custom: {
    autoswagger: {
      typefiles: ['src/types/api-types.d.ts'],
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ProductsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'aws-test-shop-Products',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S', },
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
      StocksTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'aws-test-shop-Stocks',
          AttributeDefinitions: [
            { AttributeName: 'product_id', AttributeType: 'S', },
          ],
          KeySchema: [
            { AttributeName: 'product_id', KeyType: 'HASH' },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
