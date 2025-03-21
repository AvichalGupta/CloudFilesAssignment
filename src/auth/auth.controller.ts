import {
  Body,
  Controller,
  HttpStatus,
  Injectable,
  Post,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { IStandardResponse, ResponseMessages } from 'src/app.interface';
import { LendersService } from 'src/lenders/lenders.service';
import * as bcrypt from 'bcrypt';
import { ILoginPayload, Roles } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { UsersService } from 'src/users/users.service';
import { JoiValidationPipe } from 'src/validator/request-validator.pipe';
import {
  lenderSignupSchema,
  lenderLoginSchema,
  orgSignupSchema,
  orgLoginSchema,
  userSignupSchema,
  userLoginSchema,
} from 'src/validator/request-validator.validation';

@Controller({
  version: '1',
  path: 'auth',
})
@Injectable()
export class AuthController {
  constructor(
    private readonly lenderService: LendersService,
    private readonly orgService: OrganisationsService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly saltRounds = 10;

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async generateJWTToken(userId: string, userType: Roles) {
    return await this.jwtService.signAsync({ id: userId, type: userType });
  }

  @Post('/lender/signup')
  @UsePipes(new JoiValidationPipe(lenderSignupSchema))
  public async lenderSignup(@Body() body, @Res() response): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const hashedPassword = await this.hashPassword(body.password);
      body.password = hashedPassword;
      apiResponse.data = this.lenderService.addLender(body);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.lenderSignup.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('/lender/login')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public async lenderLogin(
    @Body() body: ILoginPayload,
    @Res() response,
  ): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const lenderObject = this.lenderService.getLenderByEmailOrId({
        email: body.email,
      }).lender;

      const doPasswordsMatch = await this.validatePassword(
        body.password,
        lenderObject.password,
      );

      if (!doPasswordsMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid Login Credentials',
        });
      }

      const jwtToken = await this.generateJWTToken(
        lenderObject.id,
        Roles.LENDER,
      );

      apiResponse.data = {
        token: jwtToken,
      };
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.lenderLogin.name,
        error: error,
      });
      let errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      if (apiResponse.statusCode === HttpStatus.NOT_FOUND) {
        errorMessage += ' Please Signup first.';
      }
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('/org/signup')
  @UsePipes(new JoiValidationPipe(orgSignupSchema))
  public async orgSignup(@Body() body, @Res() response): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const hashedPassword = await this.hashPassword(body.body.password);
      body.body.password = hashedPassword;
      apiResponse.data = this.orgService.addOrganisations(body.body);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.orgSignup.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('/org/login')
  @UsePipes(new JoiValidationPipe(orgLoginSchema))
  public async orgLogin(
    @Body() body: ILoginPayload,
    @Res() response,
  ): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const orgObject = this.orgService.getOrganisationsByEmailOrId({
        email: body.email,
      }).organisations;

      const doPasswordsMatch = await this.validatePassword(
        body.password,
        orgObject.password,
      );

      if (!doPasswordsMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid Login Credentials',
        });
      }

      const jwtToken = await this.generateJWTToken(orgObject.id, Roles.ORG);

      apiResponse.data = {
        token: jwtToken,
      };
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.orgLogin.name,
        error: error,
      });
      let errorMessage: string = error.message;
      if (apiResponse.statusCode === HttpStatus.NOT_FOUND) {
        errorMessage += ' Please Signup first.';
      }
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('/org/user/signup')
  @UsePipes(new JoiValidationPipe(userSignupSchema))
  public async userSignup(@Body() body, @Res() response): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const hashedPassword = await this.hashPassword(body.body.password);
      body.body.password = hashedPassword;
      apiResponse.data = this.userService.addUser(body.body);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.userSignup.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('/org/user/login')
  @UsePipes(new JoiValidationPipe(userLoginSchema))
  public async userLogin(
    @Body() body: ILoginPayload,
    @Res() response,
  ): Promise<void> {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const orgObject = this.userService.getUserByEmailOrEmployeeId({
        email: body.email,
      }).user;

      const doPasswordsMatch = await this.validatePassword(
        body.password,
        orgObject.password,
      );

      if (!doPasswordsMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid Login Credentials',
        });
      }

      const jwtToken = await this.generateJWTToken(orgObject.id, Roles.ORG);

      apiResponse.data = {
        token: jwtToken,
      };
    } catch (error) {
      console.error('Controller level error ', {
        fileName: AuthController.name,
        methodName: this.userLogin.name,
        error: error,
      });
      let errorMessage: string = error.message;
      if (apiResponse.statusCode === HttpStatus.NOT_FOUND) {
        errorMessage += ' Please Signup first.';
      }
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }
}
