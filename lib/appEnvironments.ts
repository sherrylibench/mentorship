import { Cors } from "aws-cdk-lib/aws-apigateway";

export const appEnvironments = {
    env:{ 
        account: '874345348099', 
        region: 'us-east-1',
    },
    hostedZoneName : 'embedded.sandbox.bench.co',
    prefix : 'sherry',
    params : {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
    }
}