export interface Rooms {
  id: string;
  lenderId: string;
  name: string;
  maxCapacity: number;
  location: string;
  availableFrom: Date;
  minBookingIntervalInMinutes: number;
  price: string;
}

export interface IAddRoomPayload {
  name: string;
  lenderId: string;
  maxCapacity: number;
  location: string;
  availableFrom: string;
  minBookingIntervalInMinutes: number;
  price: string;
}

export interface IEditRoomPayload {
  id: string;
  name: string;
  maxCapacity: number;
  location: string;
  availableFrom: string;
  price: string;
}
