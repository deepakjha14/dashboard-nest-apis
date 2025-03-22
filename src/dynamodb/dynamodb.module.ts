import {Module} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBService } from './dynamodb.service';
import dynamodbConfig from '../config/dynamodb.config';

@Module({
    imports: [
      ConfigModule.forFeature(dynamodbConfig),
    ],
    providers: [DynamoDBService],
    exports: [DynamoDBService],
  })
  export class DynamoDBModule {} 