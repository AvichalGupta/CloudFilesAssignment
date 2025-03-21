import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { IStandardResponse, ResponseMessages } from 'src/app.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { JoiValidationPipe } from 'src/validator/request-validator.pipe';
import {
  createBookingSchema,
  editBookingSchema,
} from 'src/validator/request-validator.validation';
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
  public getAllInternalBookings(@Res() response) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const bookings = this.roomsAndBookingsService.getAllInternalBookings();

      if (!bookings.length) {
        throw {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No Bookings Found!!',
        };
      }
      apiResponse.data = bookings;
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

  @Get('get')
  public getAllBookings(@Req() request, @Res() response) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      apiResponse.data =
        this.roomsAndBookingsService.getAllBookings(userDataFromToken);
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

  @Get('get/:id')
  public getBookingById(
    @Req() request,
    @Param('id') bookingId: string,
    @Res() response,
  ) {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      if (!bookingId) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Parameter id cannot be empty',
        };
      }
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

  @Post('create')
  @UsePipes(new JoiValidationPipe(createBookingSchema))
  public addBookings(@Req() request, @Body() body, @Res() response): void {
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
        body,
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
  @UsePipes(new JoiValidationPipe(editBookingSchema))
  public editBookings(@Req() request, @Body() body, @Res() response): void {
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
        body,
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

  @Delete('delete/:id')
  public deleteBookings(
    @Req() request,
    @Param('id') bookingId: string,
    @Res() response,
  ): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      if (!bookingId) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Parameter id cannot be empty',
        };
      }
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];

      apiResponse.data = this.roomsAndBookingsService.deleteBooking(
        userDataFromToken,
        bookingId,
      );
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
