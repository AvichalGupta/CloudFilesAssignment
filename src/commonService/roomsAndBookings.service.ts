import { HttpStatus, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class RoomsAndBookingService {
  private rooms: Rooms[];
  private bookings: Bookings[];
  private availableSlots: Map<
    string,
    { startsAt: Date; endsAt: Date; booked: boolean }[]
  >;
  constructor(
    private readonly lenderService: LendersService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.rooms = [];
    this.bookings = [];

    this.availableSlots = new Map();
  }

  // ---------------------------- BOOKINGS LOGIC STARTS ----------------------------
  private getAvailableBookingSlots(roomData: Rooms) {
    const endsAt = new Date(roomData.availableFrom);
    endsAt.setDate(
      endsAt.getDate() +
        +this.configService.getOrThrow('MIN_BOOKING_INTERVAL_DAYS'),
    );

    const minTimeIntervals = roomData.minBookingIntervalInMinutes * 60 * 1000;

    const bookingIntervals = Math.floor(
      (endsAt.getTime() - new Date(roomData.availableFrom).getTime()) /
        minTimeIntervals,
    );

    const startingDate = new Date(roomData.availableFrom);

    let counter = 0;
    const intervals: { startsAt: Date; endsAt: Date; booked: boolean }[] = [];
    while (counter <= bookingIntervals) {
      const startDateCopy = new Date(startingDate);
      startingDate.setMinutes(
        startingDate.getMinutes() + roomData.minBookingIntervalInMinutes,
      );
      const endDateCopy = new Date(startingDate);
      intervals.push({
        startsAt: startDateCopy,
        endsAt: endDateCopy,
        booked: false,
      });
      counter++;
    }

    return intervals;
  }

  public getAllInternalBookings() {
    return this.bookings;
  }

  public getAvailableSlots() {
    return this.availableSlots;
  }

  public getAllBookings(userDataFromToken: {
    id: string;
    type: Roles;
  }): Bookings[] {
    switch (userDataFromToken.type) {
      case Roles.LENDER: {
        const lendersRoomIds = this.getAllRooms()
          .filter((roomData) => {
            return roomData.lenderId === userDataFromToken.id;
          })
          .map((roomObject) => {
            return roomObject.id;
          });

        if (!lendersRoomIds.length) {
          throw {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No rooms found for current lender.',
          };
        }

        const bookings = this.getAllInternalBookings().filter((bookingObj) => {
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

        console.log('employeeIds: ', orgsEmployees);

        const bookings = this.getAllInternalBookings().filter((bookingObj) => {
          console.log('booking employeeId: ', bookingObj);
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
        const bookings = this.getAllInternalBookings().filter((bookingObj) => {
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

        const roomBookings = this.getAllBookings(userDataFromToken).filter(
          (roomBooking) => {
            return roomBooking.roomId === roomData.id;
          },
        );

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

        const roomBookingsByOrgEmployees = this.getAllBookings(
          userDataFromToken,
        ).filter((roomBooking) => {
          return roomBooking.roomId === roomData.id;
        });

        return roomBookingsByOrgEmployees;
      }
      case Roles.USER: {
        const roomData = this.getRoomById(roomId);

        const roomBookingsByUser = this.getAllBookings(
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
    const bookingData = this.getAllBookings(userDataFromToken).filter(
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

    try {
      const roomBookings = this.getAllBookings(userDataFromToken).filter(
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
    } catch (error) {
      console.error('Service level error ', {
        fileName: RoomsAndBookingService.name,
        methodName: this.addBooking.name,
        error: error,
      });
    }

    if (requestPayload.participantsEmployeeIds.length > roomData.maxCapacity) {
      throw {
        statausCode: HttpStatus.BAD_REQUEST,
        message: `Maximum ${roomData.maxCapacity} people allowed. Please reduce participants.`,
      };
    }

    this.bookings.push(newlyAddedBooking);

    this.editAvailableSlotsByRoomId(
      requestPayload.roomId,
      requestPayload.startsAt,
      requestPayload.endsAt,
      true,
    );

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

    const bookingIndex = this.getAllBookings(userDataFromToken).findIndex(
      (booking) => bookingObject.id === booking.id,
    );

    if (requestPayload.startsAt || requestPayload.endsAt) {
      // mark old booking as not booked.
      this.editAvailableSlotsByRoomId(
        bookingObject.roomId,
        this.bookings[bookingIndex].startsAt,
        this.bookings[bookingIndex].endsAt,
      );

      // mark new booking as booked.
      this.editAvailableSlotsByRoomId(
        bookingObject.roomId,
        requestPayload.startsAt,
        requestPayload.endsAt,
        true,
      );
    }

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
    const bookings = this.getAllBookings(userDataFromToken);
    const bookingIndex = bookings.findIndex(
      (booking) => booking.id === bookingId,
    );
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

    const bookingDetails = bookings[bookingIndex];
    this.editAvailableSlotsByRoomId(
      bookingDetails.roomId,
      bookingDetails.startsAt,
      bookingDetails.endsAt,
    );

    this.bookings.splice(bookingIndex, 1);

    return {
      deletedBookingId: bookingId,
    };
  }
  // ---------------------------- BOOKINGS LOGIC ENDS ----------------------------

  // ---------------------------- ROOMS LOGIC STARTS ----------------------------
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

    this.createAvailableSlotsByRoomId(newlyAddedRoom);

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
      const availableSlotsToBeEdited: { startsAt: string; endsAt: string }[] =
        [];
      try {
        this.getBookingsByRoomId(userDataFromToken, requestPayload.id)
          .filter((roomBooking) => {
            return (
              'status' in roomBooking &&
              roomBooking.status === BookingStatus.SCHEDULED
            );
          })
          .forEach((bookingObj) => {
            console.log(
              'bookingObj in editRoom: ',
              bookingObj,
              new Date(bookingObj.startsAt).getTime(),
              new Date(requestPayload.availableFrom).getTime(),
              new Date(bookingObj.startsAt).getTime() <
                new Date(requestPayload.availableFrom).getTime(),
            );
            if (
              new Date(bookingObj.startsAt).getTime() <
              new Date(requestPayload.availableFrom).getTime()
            ) {
              if ('id' in bookingObj) {
                this.deleteBooking(userDataFromToken, bookingObj.id as string);
              }
            } else {
              availableSlotsToBeEdited.push(bookingObj);
            }
          });
      } catch (error) {
        console.error('Service level error ', {
          fileName: RoomsAndBookingService.name,
          methodName: this.editRoom.name,
          error: error,
        });
      }

      this.removeAvailableSlotsByRoomId(requestPayload.id);
      this.createAvailableSlotsByRoomId(roomObject);
      availableSlotsToBeEdited.forEach((bookingObj) => {
        this.editAvailableSlotsByRoomId(
          requestPayload.id,
          bookingObj.startsAt,
          bookingObj.endsAt,
          true,
        );
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
        statusCode: HttpStatus.BAD_REQUEST,
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
    try {
      this.removeAvailableSlotsByRoomId(roomId);
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
    } catch (error) {
      console.error('Controller level error ', {
        fileName: RoomsAndBookingService.name,
        methodName: this.deleteRoom.name,
        error: error,
      });
    }

    return {
      deletedRoomId: roomId,
    };
  }
  // ---------------------------- ROOMS LOGIC STARTS ----------------------------

  // ---------------------------- AVAILABLE SLOTS LOGIC STARTS ----------------------------
  public getAvailableSlotsByRoomId(roomId: string) {
    const roomData = this.getRoomById(roomId);

    return this.availableSlots.get(roomData.id) || [];
  }

  public createAvailableSlotsByRoomId(roomData: Rooms) {
    this.availableSlots.set(
      roomData.id,
      this.getAvailableBookingSlots(roomData),
    );
  }

  public editAvailableSlotsByRoomId(
    roomId: string,
    startsAt: string,
    endsAt: string,
    booked: boolean = false,
  ) {
    let roomIndex = -1;
    const roomBooking = this.getAvailableSlotsByRoomId(roomId).filter(
      (roomBooking, index) => {
        if (
          new Date(roomBooking.startsAt).getTime() ===
            new Date(startsAt).getTime() &&
          new Date(roomBooking.endsAt).getTime() === new Date(endsAt).getTime()
        ) {
          roomIndex = index;
          return true;
        }
        return false;
      },
    )[0];

    console.log(
      'editAvailableSlotsByRoomId: ',
      roomId,
      startsAt,
      endsAt,
      booked,
      roomIndex,
      roomBooking,
    );
    const updateAvailableSlots = this.availableSlots.get(roomId);

    if (updateAvailableSlots && roomIndex !== -1) {
      roomBooking.booked = booked;
      updateAvailableSlots[roomIndex] = roomBooking;
      this.availableSlots.set(roomId, updateAvailableSlots);
    } else {
      throw new Error('Could not update available slots for room.');
    }
  }

  public removeAvailableSlotsByRoomId(roomId: string) {
    this.availableSlots.delete(roomId);
  }
}
