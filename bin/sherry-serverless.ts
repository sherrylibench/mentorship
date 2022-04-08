#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SherryServerlessStack } from '../lib/sherry-serverless-stack';

const app = new cdk.App();

const env  = { account: '874345348099', region: 'us-east-1' };


new SherryServerlessStack(app, 'SherryServerlessStack',{env});
