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
import { JoiValidationPipe } from 'src/validator/request-validator.pipe';
import { lenderLoginSchema } from 'src/validator/request-validator.validation';
import { Roles } from 'src/auth/auth.interface';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';

@UseGuards(AuthGuard)
@Controller({
  version: '1',
  path: 'bookings',
})
export class BookingsController {
  constructor(
    private readonly roomsAndBookingsService: RoomsAndBookingService,
  ) {}
  @Get('get/internal')
  public getAllBookings(@Req() request, @Res() response) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      apiResponse.data = this.roomsAndBookingsService.getAllBookings();
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.getAllBookings.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Get('get')
  public getAllInternalBookings(@Req() request, @Res() response) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      apiResponse.data =
        this.roomsAndBookingsService.getAllInternalBookings(userDataFromToken);
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.getAllInternalBookings.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Get('get/:id')
  public getBookingById(
    @Req() request,
    @Query('id') bookingId: string,
    @Res() response,
  ) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      apiResponse.data = this.roomsAndBookingsService.getBookingById(
        userDataFromToken,
        bookingId,
      );
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.getBookingById.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Post('book')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public addBookings(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      apiResponse.data = this.roomsAndBookingsService.addBooking(
        userDataFromToken,
        request.body,
      );
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.addBookings.name,
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
  public editBookings(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      apiResponse.data = this.roomsAndBookingsService.editBooking(
        userDataFromToken,
        request.body,
      );
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.editBookings.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }

  @Delete('delete')
  @UsePipes(new JoiValidationPipe(lenderLoginSchema))
  public deleteBookings(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      console.log('ho');
    } catch (error) {
      console.error('Controller level error ', {
        fileName: BookingsController.name,
        methodName: this.deleteBookings.name,
        error: error,
      });
      const errorMessage: string = error.message;
      apiResponse.statusCode = error?.statusCode || HttpStatus.BAD_REQUEST;
      apiResponse.message = errorMessage || ResponseMessages.error;
    }
    response.status(apiResponse.statusCode).send(apiResponse);
  }
}
