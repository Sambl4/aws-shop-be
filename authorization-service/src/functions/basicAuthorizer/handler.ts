import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { middyfy } from '@libs/lambda';

import schema from './schema';

const basicAuthorizer = async (event) => {
  console.log('basicAuthorizer event: ', event);

  if(event.type !== 'REQUEST') {
    return formatJSONResponse('Unauthorized', 401);
  }

  const base64Token = event.headers.authorization.split(' ')[1];

  try{
    const token = atob(base64Token).split(':');
    const username = token[0];
    const pass = token[1];
  
    console.log(`User: ${username}, pass: ${pass}`);
  
    const storedPass = process.env[username];
    const effect = !storedPass || storedPass !== pass ? 'Deny' : 'Allow';
  
    return generatePolicy(base64Token, event.routeArn, effect);
  } catch (e) {
    console.log(`Unauthorized: ${e.message}`);
    return generatePolicy(base64Token, event.routeArn, 'Deny');
  }
};

const generatePolicy = (principalId, resource, effect) => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        }
      ]
    }
  }
};

export const main = middyfy(basicAuthorizer );
