export interface Bookings {
  id: string;
  hostEmployeeId: string;
  participantsEmployeeIds: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
}

export interface IAddBookingPayload {
  hostEmployeeId: string;
  participantsEmployeeIds: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
}

export interface IEditBookingPayload {
  id: string;
  startsAt: string;
  endsAt: string;
  participantsEmployeeIds: string;
  status: BookingStatus;
}

export enum BookingStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  MISSED = 'missed',
}
