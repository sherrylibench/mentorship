import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamo from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export interface HitCounterProps {
    downstream: lambda.IFunction;
}
export class HitCounter extends Construct {
    public readonly handler: lambda.Function;
    constructor(scope: Construct, id: string, props: HitCounterProps){
        super(scope, id);
        const table = new dynamo.Table( this, 'SherryHits', {
            partitionKey: {name: 'path', type: dynamo.AttributeType.STRING}
        });

        this.handler = new lambda.Function(this, 'SherryHitCounterHandler',{
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment:{
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName,
            }
        });
        table.grantReadWriteData(this.handler);
        props.downstream.grantInvoke(this.handler);
    }
}