import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { access } from 'fs';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const tableName = this.configService.get<string>('DYNAMODB_TABLE_NAME');

    if (!region || !accessKeyId || !secretAccessKey || !tableName) {
        throw new UnauthorizedException('Missing required DynamoDB configuration');
    }

    try {
        this.client = new DynamoDBClient({
            region,
            credentials: {
              accessKeyId,
              secretAccessKey
            },
        });
    } catch (error: any) {
        console.error('Error creating DynamoDB client:', error);
        throw error;
    }
    this.tableName = tableName;
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async getAllItems() {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    try {
        const response = await this.docClient.send(command);
        return this.parseDataFromDynamoTables(response.Items);
    } catch (error: any) {
        console.error('Error scanning items from DynamoDB:', error);
        throw error;
    }
  }

  saveData({data}: any) {
    debugger
    const command = new PutCommand({
      TableName: 'Students',
      Item: {
        id: new Date().toString(),
        ...data
      },
    });
    this.docClient.send(command)
  }

  async getAllStudents() {
    const command = new ScanCommand({
      TableName: 'Students',
    });
    try {
        const response = await this.docClient.send(command);
        const parsedData = this.parseDataFromDynamoTables(response.Items);
        return parsedData;
    } catch (error: any) {
        console.error('Error scanning items from DynamoDB:', error);
        throw error;
    }
  }

  parseDataFromDynamoTables(data: any) {
    const parsedData: any = [];
    data.forEach((item: any) => {
      const parsedItem = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const value = item[key];
          if (value && value.S) {
            parsedItem[key] = value.S;
          } else if (value && value.N) {
            parsedItem[key] = parseInt(value.N, 10);
          } else {
            parsedItem[key] = value;
          }
        }
      }
      parsedData.push(parsedItem);
    });
    return parsedData;
  }
}
