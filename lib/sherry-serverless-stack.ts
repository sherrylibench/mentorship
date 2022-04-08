import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { HitCounter } from './hitcounter';
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'

export class SherryServerlessStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rootDomain = 'embedded.sandbox.bench.co';

    const zone = route53.HostedZone.fromLookup(this, "baseZone", {
      domainName: rootDomain,
    });

    const hello = new lambda.Function(this, 'SherryHelloHandler',{
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler'
    });

    const helloCounter = new HitCounter(this, 'SherryHitCounterHandler',{
      downstream:hello,
    })

    const sherryRestAPI = new apigw.LambdaRestApi(this, 'SherryRestAPI',{
      handler: helloCounter.handler,
      domainName: {
        domainName:`sherry-test-cdk.${rootDomain}`,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "sherry-cert",
          " arn:aws:acm:us-east-1:874345348099:certificate/4a8b604f-efc0-4f7f-9b22-6fb0010a6e56"
        ),
        endpointType: apigw.EndpointType.REGIONAL,
      },
    });

    new route53.ARecord(this, "sherry-test-cdk-dns", {
      zone: zone,
      recordName: "sherry-test-cdk",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(sherryRestAPI)
      ),
    });
  }
}
