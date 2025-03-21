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
import { Roles } from 'src/auth/auth.interface';
import { RoomsAndBookingService } from 'src/commonService/roomsAndBookings.service';
import { JoiValidationPipe } from 'src/validator/request-validator.pipe';
import {
  createRoomSchema,
  editRoomSchema,
} from 'src/validator/request-validator.validation';

@UseGuards(AuthGuard)
@Controller({
  version: '1',
  path: 'rooms',
})
export class RoomsController {
  constructor(
    private readonly roomsAndBookingsService: RoomsAndBookingService,
  ) {}

  @Get('get')
  public getAllRooms(@Req() request, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const rooms = this.roomsAndBookingsService.getAllRooms();
      if (!rooms.length) {
        throw {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No Rooms Found!!',
        };
      }
      apiResponse.data = rooms;
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
  public getRoomById(@Param('id') roomId: string, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      if (!roomId) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Parameter id cannot be empty',
        };
      }
      apiResponse.data = {
        ...this.roomsAndBookingsService.getRoomById(roomId),
        allSlots:
          this.roomsAndBookingsService.getAvailableSlotsByRoomId(roomId),
      };
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

  @Post('add')
  @UsePipes(new JoiValidationPipe(createRoomSchema))
  public addRooms(@Req() request, @Body() body, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      body.lenderId = userDataFromToken.id;

      apiResponse.data = this.roomsAndBookingsService.addRoom(body);
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
  @UsePipes(new JoiValidationPipe(editRoomSchema))
  public editRooms(@Req() request, @Body() body, @Res() response): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      const userDataFromToken: { id: string; type: Roles } = request['user'];
      delete request['user'];
      body.lenderId = userDataFromToken.id;
      apiResponse.data = this.roomsAndBookingsService.editRoom(
        userDataFromToken,
        body,
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
  public deleteRooms(
    @Req() request,
    @Param('id') roomId: string,
    @Res() response,
  ): void {
    const apiResponse: IStandardResponse = {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.success,
      data: {},
    };
    try {
      if (!roomId) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Parameter id cannot be empty',
        };
      }
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
}
