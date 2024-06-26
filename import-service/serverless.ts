import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/import-products-file';
import importFileParser from '@functions/import-file-parser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'eu-west-1',
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
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: [
        's3:*',
        's3:List*',
        's3:PutObject',
        's3:PutObjectAcl',
        's3:DeleteObject',
        'S3:GetObjectTagging',
        'S3:PutObjectTagging',
      ],
      Resource: [
        'arn:aws:s3:::aws-test-shop-import-bucket/*',
      ],
    }],
  },
  // import the function via paths
  functions: {
    importFileParser,
    importProductsFile
  },
  package: { individually: true },
  custom: {
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
      Bucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'aws-test-shop-import-bucket',
          PublicAccessBlockConfiguration: {
            BlockPublicPolicy: false,
          },
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['PUT'],
                AllowedOrigins: [
                  'http://localhost:5173',
                  'https://d2exfjxf8vormv.cloudfront.net',
                ],
              },
            ],
          },
        },
      }
    }
  }
};

module.exports = serverlessConfiguration;
