import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Issuer, TokenSet, Client } from 'openid-client';

@Injectable()
export class AuthService {
  private cognitoClient: Client | null = null;

  constructor(
    private configService: ConfigService
  ) {}

  private async getCognitoClient() {
    if (this.cognitoClient) {
        return this.cognitoClient;
    }

    const region = this.configService.get<string>('auth.cognitoRegion');
    const userPoolDomain = this.configService.get<string>('auth.cognitoUserPoolDomain');
    const clientId = this.configService.get<string>('auth.cognitoClientId');
    const callbackUrl = this.configService.get<string>('auth.callbackUrl');
    const clientSecret = this.configService.get<string>('auth.cognitoClientSecret');
    const userPoolId = this.configService.get<string>('auth.cognitoUserPoolId');

    if (!region || !userPoolDomain || !clientId || !callbackUrl || !userPoolId) {
        throw new UnauthorizedException('Missing required Cognito configuration');
    }

    const cognitoIssuer = await Issuer.discover(
        `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
    );
  
    this.cognitoClient = new cognitoIssuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [callbackUrl],
        response_types: ['code'],
    });

    return this.cognitoClient;
  }

  async getCognitoLoginUrl(): Promise<string> {
    const client = await this.getCognitoClient();
    const callbackUrl = this.configService.get<string>('auth.callbackUrl');

    return client.authorizationUrl({
      scope: 'openid email phone',
      response_type: 'code',
      redirect_uri: callbackUrl,
    });
  }

  async handleCallback(code: string) {
    const client = await this.getCognitoClient();
    const callbackUrl = this.configService.get<string>('auth.callbackUrl');

    if (!callbackUrl) {
      throw new UnauthorizedException('Missing callback URL configuration');
    }

    try {
        return await client.callback(
            callbackUrl,
            {code},
            {code_verifier: ''}
        );
    } catch (error) {
        console.error('Token exchange error:', error);
        throw new UnauthorizedException('Failed to exchange authorization code for tokens');
    }
  }

  async validateToken(token: string) {
    const client = await this.getCognitoClient();

    try {
        return await client.userinfo(token);
    } catch (error) {
        console.error('Token validation error:', error);
        throw new UnauthorizedException('Failed to validate token');
    }
  }
}