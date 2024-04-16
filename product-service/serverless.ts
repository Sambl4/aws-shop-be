import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

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
          'https://dl0u2y8xthtyz.cloudfront.net',
        ],
      }
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SQS_URL: {
        Ref: 'SQSQueue',
      },
      SNSTopic_ARN: {
        Ref: 'SNSTopic'
      },
    },
    iamManagedPolicies: ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: [
        'sns:*',
      ],
      Resource: [{
        Ref: 'SNSTopic'
      }],
    }],
  },
  functions: {
    createProduct,
    getProductsList,
    getProductsById,
    catalogBatchProcess,
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
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'aws-test-shop-sqs-queue',
        },
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'aws-test-shop-sns-topic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'dzmitry_samuilik@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicyScope: 'MessageAttributes',
          // FilterPolicy: JSON.stringify({ body: { price: [{'numeric': ['>=', 50]}] } })
        },
      },
      SNSSubscriptionFiltered: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'dzsambl4@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicyScope: 'MessageBody',
          FilterPolicy: { 'title': [{'prefix': 'new'}] }
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
