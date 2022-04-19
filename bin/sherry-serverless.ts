#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { appEnvironments } from '../lib/appEnvironments';
import { SherryServerlessStack } from '../lib/sherry-serverless-stack';

const app = new cdk.App();

new SherryServerlessStack(app, `${appEnvironments.prefix}-stack`, appEnvironments);
