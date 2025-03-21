import { HttpStatus, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Roles } from 'src/auth/auth.interface';
import {
  Bookings,
  BookingStatus,
  IAddBookingPayload,
  IEditBookingPayload,
} from 'src/bookings/bookings.interface';
import { LendersService } from 'src/lenders/lenders.service';
import {
  Rooms,
  IAddRoomPayload,
  IEditRoomPayload,
} from 'src/rooms/rooms.interface';
import { UsersService } from 'src/users/users.service';

export class RoomsAndBookingService {
  private rooms: Rooms[];
  private bookings: Bookings[];
  private availableSlots: Map<string, { startsAt: Date; endsAt: Date }[]>;
  constructor(
    private readonly lenderService: LendersService,
    private readonly userService: UsersService,
  ) {
    this.rooms = [];
    this.bookings = [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3);

    this.availableSlots = new Map(
      this.getAllRooms()
        .filter((roomData) => {
          return (
            new Date(roomData.availableFrom).getTime() <= startDate.getTime()
          );
        })
        .map((roomData) => {
          return [
            roomData.id,
            this.getAvailableBookingSlots(roomData.id, new Date().toString()),
          ];
        }),
    );
  }

  private getAvailableBookingSlots(roomId: string, startsAt: string) {
    const roomData = this.getRoomById(roomId);

    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + 3);

    const minTimeIntervals = roomData.minBookingIntervalInMinutes * 60 * 1000;

    const bookingIntervals = Math.floor(
      (endsAt.getTime() - new Date(startsAt).getTime()) / minTimeIntervals,
    );

    const startingDate = new Date(startsAt);

    let counter = 0;
    const intervals: { startsAt: Date; endsAt: Date }[] = [];
    while (counter <= bookingIntervals) {
      intervals.push({
        startsAt: startingDate,
        endsAt: new Date(
          startingDate.setMinutes(
            startingDate.getMinutes() + roomData.minBookingIntervalInMinutes,
          ),
        ),
      });
      counter++;
    }

    return intervals;
  }

  public getAllBookings() {
    return this.bookings;
  }

  public getAvailableSlots() {
    return this.availableSlots;
  }

  public getAllInternalBookings(userDataFromToken: {
    id: string;
    type: Roles;
  }): Bookings[] {
    switch (userDataFromToken.type) {
      case Roles.LENDER: {
        const lendersRoomIds = this.getAllRooms()
          .filter((roomData) => {
            return roomData.lenderId === userDataFromToken.id;
          })
          .map((roomObj) => {
            return roomObj.id;
          });

        if (!lendersRoomIds.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No rooms found for current lender.',
          };
        }

        const bookings = this.getAllBookings().filter((bookingObj) => {
          return lendersRoomIds.includes(bookingObj.roomId);
        });

        if (!bookings.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No bookings found in any rooms for current lender.',
          };
        }

        return bookings;
      }
      case Roles.ORG: {
        const orgsEmployees = this.userService
          .getAllUsers()
          .filter((usersData) => {
            return usersData.orgId === userDataFromToken.id;
          })
          .map((usersData) => {
            return usersData.employeeId;
          });

        if (!orgsEmployees.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No employee records found for current org.',
          };
        }

        const bookings = this.getAllBookings().filter((bookingObj) => {
          return orgsEmployees.includes(bookingObj.hostEmployeeId);
        });

        if (!bookings.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No bookings found in any rooms for current org.',
          };
        }

        return bookings;
      }
      case Roles.USER: {
        const bookings = this.getAllBookings().filter((bookingObj) => {
          return bookingObj.hostEmployeeId === userDataFromToken.id;
        });

        if (!bookings.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No bookings found for current user.',
          };
        }
        return bookings;
      }
      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Please login to view rooms bookings/available slots.',
        });
      }
    }
  }

  public getBookingsByRoomId(
    userDataFromToken: {
      id: string;
      type: Roles;
    },
    roomId: string,
  ) {
    switch (userDataFromToken.type) {
      case Roles.LENDER: {
        const roomData = this.getRoomById(roomId);

        const roomBookings = this.getAllInternalBookings(
          userDataFromToken,
        ).filter((roomBooking) => {
          return roomBooking.roomId === roomData.id;
        });

        if (roomData.lenderId !== userDataFromToken.id) {
          return roomBookings.map((roomBookings) => {
            return {
              startsAt: roomBookings.startsAt,
              endsAt: roomBookings.endsAt,
            };
          });
        }

        return roomBookings;
      }
      case Roles.ORG: {
        const roomData = this.getRoomById(roomId);

        const roomBookingsByOrgEmployees = this.getAllInternalBookings(
          userDataFromToken,
        ).filter((roomBooking) => {
          return roomBooking.roomId === roomData.id;
        });

        return roomBookingsByOrgEmployees;
      }
      case Roles.USER: {
        const roomData = this.getRoomById(roomId);

        const roomBookingsByUser = this.getAllInternalBookings(
          userDataFromToken,
        ).filter((roomBooking) => {
          return roomBooking.roomId === roomData.id;
        });

        return roomBookingsByUser;
      }
      default: {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Please login to view rooms bookings/available slots.',
        });
      }
    }
  }

  public getBookingById(
    userDataFromToken: {
      id: string;
      type: Roles;
    },
    bookingId: string,
  ): Bookings {
    const bookingData = this.getAllInternalBookings(userDataFromToken).filter(
      (bookingData) => {
        return bookingData.id === bookingId;
      },
    )[0];

    if (!bookingData) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Booking does not exists with provided id.',
      };
    }

    return bookingData;
  }

  public addBooking(
    userDataFromToken: { id: string; type: Roles },
    requestPayload: IAddBookingPayload,
  ) {
    const newlyAddedBooking: Bookings = {
      ...requestPayload,
      status: BookingStatus.SCHEDULED,
      id: randomUUID(),
    };

    const roomData = this.getRoomById(requestPayload.roomId);

    const payloadStartsAt = new Date(requestPayload.startsAt);
    const payloadEndsAt = new Date(requestPayload.endsAt);

    if (payloadEndsAt.getTime() <= payloadStartsAt.getTime()) {
      throw {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'End Date cannot be on or before Start Date.',
      };
    }

    if (
      payloadStartsAt.getTime() < new Date(roomData.availableFrom).getTime()
    ) {
      throw {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Room not available on specified date.',
      };
    }

    const roomBookings = this.getAllInternalBookings(userDataFromToken).filter(
      (roomBooking) => {
        return roomBooking.roomId === requestPayload.roomId;
      },
    );

    const roomBookedOnDate = roomBookings.filter((roomBooking) => {
      const bookingStartsAt = new Date(roomBooking.startsAt);
      const bookingEndsAt = new Date(roomBooking.endsAt);
      return (
        (requestPayload.roomId === roomBooking.roomId &&
          bookingStartsAt.getTime() === payloadStartsAt.getTime() &&
          bookingEndsAt.getTime() === payloadEndsAt.getTime()) ||
        (requestPayload.roomId === roomBooking.roomId &&
          payloadStartsAt.getTime() >= bookingStartsAt.getTime() &&
          payloadStartsAt.getTime() < bookingEndsAt.getTime()) ||
        (requestPayload.roomId === roomBooking.roomId &&
          payloadEndsAt.getTime() >= bookingStartsAt.getTime() &&
          payloadEndsAt.getTime() < bookingEndsAt.getTime())
      );
    });

    if (roomBookedOnDate.length) {
      throw {
        statausCode: HttpStatus.CONFLICT,
        message:
          'Room already booked, please select a different date time combination.',
      };
    }

    if (requestPayload.participantsEmployeeIds.length > roomData.maxCapacity) {
      throw {
        statausCode: HttpStatus.BAD_REQUEST,
        message: `Maximum ${roomData.maxCapacity} people allowed. Please reduce participants.`,
      };
    }

    this.bookings.push(newlyAddedBooking);

    return {
      bookingId: newlyAddedBooking.id,
    };
  }

  public editBooking(
    userDataFromToken: { id: string; type: Roles },
    requestPayload: IEditBookingPayload,
  ) {
    const bookingObject: Bookings = this.getBookingById(
      userDataFromToken,
      requestPayload.id,
    );

    if (requestPayload.startsAt) {
      bookingObject.startsAt = requestPayload.startsAt;
    }
    if (requestPayload.endsAt) {
      bookingObject.endsAt = requestPayload.endsAt;
    }
    if (requestPayload.participantsEmployeeIds) {
      bookingObject.participantsEmployeeIds =
        requestPayload.participantsEmployeeIds;
    }

    const bookingIndex = this.getAllInternalBookings(
      userDataFromToken,
    ).findIndex((booking) => bookingObject.id === booking.id);

    this.bookings[bookingIndex] = bookingObject;

    return this.getBookingById(userDataFromToken, requestPayload.id);
  }

  public deleteBooking(
    userDataFromToken: {
      id: string;
      type: Roles;
    },
    bookingId: string,
  ) {
    const bookingIndex = this.getAllInternalBookings(
      userDataFromToken,
    ).findIndex((booking) => booking.id === bookingId);

    if (bookingIndex === -1) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Booking does not exist.',
      };
    }

    if (this.getBookingById(userDataFromToken, bookingId).id !== bookingId) {
      throw new ForbiddenException({
        statusCode: 403,
        message:
          'Cannot perform this operation, you are not the owner of this booking.',
      });
    }

    this.bookings.splice(bookingIndex, 1);
  }

  public getAllRooms(): Rooms[] {
    return this.rooms;
  }

  public getRoomById(id: string): Rooms {
    const roomData = this.getAllRooms().filter((roomData) => {
      return roomData.id === id;
    })[0];

    if (!roomData) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room does not exists with provided id.',
      };
    }

    return roomData;
  }

  public addRoom(requestPayload: IAddRoomPayload) {
    const lenderIdFromPayload = requestPayload.lenderId;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doesLenderExists = this.lenderService.getLenderByEmailOrId({
      id: lenderIdFromPayload,
    }).lender;

    if (requestPayload.availableFrom) {
      if (
        new Date(requestPayload.availableFrom).getTime() < new Date().getTime()
      ) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Available From must be greater than current date.',
        };
      }
    }

    const newlyAddedRoom: Rooms = {
      ...requestPayload,
      availableFrom: requestPayload.availableFrom
        ? new Date(requestPayload.availableFrom)
        : new Date(),
      id: randomUUID(),
    };
    this.rooms.push(newlyAddedRoom);

    return {
      roomId: newlyAddedRoom.id,
    };
  }

  public editRoom(
    userDataFromToken: { id: string; type: Roles },
    requestPayload: IEditRoomPayload,
  ) {
    const roomObject: Rooms = this.getRoomById(requestPayload.id);

    if (requestPayload.name) {
      roomObject.name = requestPayload.name;
    }
    if (requestPayload.maxCapacity) {
      roomObject.maxCapacity = requestPayload.maxCapacity;
    }
    if (requestPayload.location) {
      roomObject.location = requestPayload.location;
    }
    if (requestPayload.availableFrom) {
      if (
        new Date(requestPayload.availableFrom).getTime() < new Date().getTime()
      ) {
        throw {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Available From must be greater than current date.',
        };
      }
      roomObject.availableFrom = new Date(requestPayload.availableFrom);
    }
    if (requestPayload.price) {
      roomObject.price = requestPayload.price;
    }

    const roomIndex = this.getAllRooms().findIndex(
      (room) => roomObject.id === room.id,
    );

    this.rooms[roomIndex] = roomObject;

    if (requestPayload.availableFrom) {
      this.getBookingsByRoomId(userDataFromToken, requestPayload.id)
        .filter((roomBooking) => {
          return (
            'status' in roomBooking &&
            roomBooking.status === BookingStatus.SCHEDULED
          );
        })
        .forEach((bookingObj) => {
          if (
            new Date(bookingObj.startsAt).getTime() <
            new Date(requestPayload.availableFrom).getTime()
          ) {
            if ('id' in bookingObj) {
              this.deleteBooking(userDataFromToken, bookingObj.id as string);
            }
          }
        });
    }

    return this.getRoomById(requestPayload.id);
  }

  public deleteRoom(
    userDataFromToken: { id: string; type: Roles },
    lenderId: string,
    roomId: string,
  ) {
    const roomIndex = this.getAllRooms().findIndex(
      (room) => room.id === roomId,
    );

    if (roomIndex === -1) {
      throw {
        statusCode: 400,
        message: 'Room does not exists',
      };
    }

    if (this.getRoomById(roomId).lenderId !== lenderId) {
      throw new ForbiddenException({
        statusCode: 403,
        message:
          'Cannot perform this operation, you are not the owner of this room.',
      });
    }

    this.rooms.splice(roomIndex, 1);
    this.getBookingsByRoomId(userDataFromToken, roomId)
      .filter((roomBooking) => {
        return (
          'status' in roomBooking &&
          roomBooking.status === BookingStatus.SCHEDULED
        );
      })
      .forEach((bookingObj) => {
        if ('id' in bookingObj) {
          this.deleteBooking(userDataFromToken, bookingObj.id as string);
        }
      });
  }
}
