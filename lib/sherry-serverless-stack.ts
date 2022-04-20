import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { HitCounter } from './hitcounter';
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

type sherryStackProps = cdk.StackProps & {
  hostedZoneName: string,
  prefix: string,
}

export class SherryServerlessStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: sherryStackProps) {
    super(scope, id, props);

    //3 lambda functions
    const hello = new lambda.Function(this, `${props.prefix}-HelloHandler`,{
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
    });

    const helloCounter = new HitCounter(this, `${props.prefix}-HitCounterHandler`,{
      downstream: hello,
    })

    const nodejsFunction = new NodejsFunction(this,`${props.prefix}-NodejsFunctionHandler`, {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main',
      entry: path.join(__dirname, `/../lambda/nodeFunction.ts`),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });
    
    //custom domain
    const hostedZoneName = props.hostedZoneName;

    const hostedZone = route53.HostedZone.fromLookup(this, "hostedZone", {
      domainName: hostedZoneName,
    });

    //api gateway
    const sherryRestAPI = new apigw.RestApi(this, `${props.prefix}-restAPI`,{
      endpointConfiguration: {
        types:[apigw.EndpointType.REGIONAL],
      },
      domainName: {
        domainName:`${props.prefix}.${hostedZoneName}`,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          `${props.prefix}-certificate`,
          "arn:aws:acm:us-east-1:874345348099:certificate/4a8b604f-efc0-4f7f-9b22-6fb0010a6e56"
        ),
        endpointType: apigw.EndpointType.REGIONAL,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    //create handler
    const rescource = sherryRestAPI.root;
    rescource.addMethod(
      'GET', 
      new LambdaIntegration(helloCounter.handler, {})
    );
    rescource.addMethod(
      'POST', 
      new LambdaIntegration(nodejsFunction, {})
    );

    // gateway response
    sherryRestAPI.addGatewayResponse(
      `${props.prefix}-access-denied-response`,
      {
        type: apigw.ResponseType.MISSING_AUTHENTICATION_TOKEN,
        statusCode: '403',
        templates: {
          'application/json': JSON.stringify({
            code: 'MISSING_AUTHENTICATION_TOKEN',
            message: '$context.error.message',
            reason: 'The HTTP method or resources may not be supported',
          }),
        },
        
      }
    );

    // ARecord
    new route53.ARecord(this, `${props.prefix}-dns`, {
      zone: hostedZone,
      recordName: `${props.prefix}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(sherryRestAPI)
      ),
    });

  }
}
