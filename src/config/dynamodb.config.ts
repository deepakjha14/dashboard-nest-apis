import { registerAs } from '@nestjs/config';

export default registerAs(
    'dynamodb',
    ()=>({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        tableName: process.env.DYNAMODB_TABLE_NAME,
    })
);