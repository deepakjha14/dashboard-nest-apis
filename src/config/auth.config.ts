import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  cognitoUserPoolDomain: process.env.COGNITO_USER_POOL_DOMAIN,
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.COGNITO_CLIENT_ID,
  cognitoClientSecret: process.env.COGNITO_CLIENT_SECRET,
  cognitoRegion: process.env.COGNITO_REGION || 'us-east-1',
  callbackUrl: process.env.COGNITO_CALLBACK_URL || 'http://localhost:4000/auth/callback',
})); 