import { Controller, Get, Post, Body, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from "./auth.service";
import { AuthGuard } from './auth.guard';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly dynamoDbService: DynamoDBService) {}
    // <domain-name>/auth/login
    @Get('login')
    async login(@Res() res: Response) {
        const loginUrl =  await this.authService.getCognitoLoginUrl();
        return res.redirect(loginUrl);
    }

   // <domain-name>/auth/token
    @Post('token')
    async exchangeToken(@Body() body: { code: string }) {
        if (!body.code) {
            throw new UnauthorizedException("No auth code provided");
        }

        try {
            const tokens: any = await this.authService.handleCallback(body.code);
            const userInfo = tokens.access_token ? await this.authService.validateToken(tokens.access_token): null;

            return {
                token: {
                    access_token: tokens.access_token,
                    id_token: tokens.id_token,
                    refresh_token: tokens.refresh_token
                },
                userInfo: userInfo
            }
        } catch (error) {
            throw new UnauthorizedException("Invalid auth code");
        }
    }

    @Get('charts')
    @UseGuards(AuthGuard)
    async getChartsData() {
        return {
            chart: {
              type: 'area'
            },
            title: {
              text: 'Area Chart'
            },
            xAxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
              title: {
                text: 'Value'
              }
            },
            series: [{
              name: 'Series 1',
              type: 'area',
              data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              color: '#7cb5ec',
              fillOpacity: 0.3
            }],
            credits: {
              enabled: false
            },
            plotOptions: {
              area: {
                marker: {
                  enabled: false
                }
              }
            }
        };
    }

    @Get('charts-data')
    @UseGuards(AuthGuard)
    async getChartsDataDb() {
        return this.dynamoDbService.getAllItems();
        // return "Returns the database data!!!";
    }

    @Get('get-students')
    async getAllStudents() {
        return this.dynamoDbService.getAllStudents();
        // return "Returns the database data!!!";
    }

    @Post('save-students')
    @UseGuards(AuthGuard)
    async saveStudents(@Body() body: { 
      name: string,
      age: number,
      country: string,
      salary: string,
      department: string,
      email: string,
      status: string,
      joinDate: string
     }) {
        return this.dynamoDbService.saveData(body);
        // return "Returns the database data!!!";
    }
}
