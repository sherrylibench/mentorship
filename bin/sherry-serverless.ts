#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SherryServerlessStack } from '../lib/sherry-serverless-stack';

const app = new cdk.App();

// move to env file
const env  = { 
    account: '874345348099', 
    region: 'us-east-1',
 };
const hostedZoneName = 'embedded.sandbox.bench.co';
const prefix = 'sherry-test';


new SherryServerlessStack(app, `${prefix}-stack`,{env,hostedZoneName,prefix});
