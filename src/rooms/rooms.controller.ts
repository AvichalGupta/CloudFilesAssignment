import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { IStandardResponse, ResponseMessages } from 'src/app.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/auth.interface';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';
import { JoiValidationPipe } from 'src/validator/request-validator.pipe';
import { lenderLoginSchema } from 'src/validator/request-validator.validation';

@UseGuards(AuthGuard)
@Controller({
  version: '1',
  path: 'rooms',
})
export class RoomsController {
  constructor(
    private readonly roomsAndBookingsService: RoomsAndBookingService,
  ) {}
  @Post('add')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public addRooms(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      request.body.lenderId = userDataFromToken.id;

      apiResponse.data = this.roomsAndBookingsService.addRoom(request.body);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsController.name,
        methodName: this.addRooms.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Patch('edit')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public editRooms(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      request.body.lenderId = userDataFromToken.id;
      apiResponse.data = this.roomsAndBookingsService.editRoom(
        userDataFromToken,
        request.body,
      );
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsController.name,
        methodName: this.editRooms.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Delete('delete/:id')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public deleteRooms(
    @Req() request,
    @Query('id') roomId: string,
    @Res() response,
  ): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      const lenderId = userDataFromToken.id;

      apiResponse.data = this.roomsAndBookingsService.deleteRoom(
        userDataFromToken,
        lenderId,
        roomId,
      );
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsController.name,
        methodName: this.deleteRooms.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Get('get')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public getAllRooms(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      apiResponse.data = this.roomsAndBookingsService.getAllRooms();
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsController.name,
        methodName: this.getAllRooms.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Get('get/:id')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public getRoomById(@Query('id') roomId: string, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      apiResponse.data = this.roomsAndBookingsService.getRoomById(roomId);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsController.name,
        methodName: this.getRoomById.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }
}
