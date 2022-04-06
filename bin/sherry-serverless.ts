#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SherryServerlessStack } from '../lib/sherry-serverless-stack';

const app = new cdk.App();
new SherryServerlessStack(app, 'SherryServerlessStack');
