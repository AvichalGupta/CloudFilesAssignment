import * as Joi from 'joi';
import { BookingStatus } from 'src/bookings/bookings.interface';

export const lenderSignupSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).unknown(false);

export const lenderLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(false);

export const orgSignupSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).unknown(false);

export const orgLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(false);

export const userSignupSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  employeeId: Joi.string().required(),
  orgId: Joi.string().required(),
}).unknown(false);

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  orgId: Joi.string().required(),
}).unknown(false);

export const createBookingSchema = Joi.object({
  hostEmployeeId: Joi.string().required(),
  participantsEmployeeIds: Joi.array<string>().required(),
  roomId: Joi.string().required(),
  startsAt: Joi.string().required(),
  endsAt: Joi.string().required(),
}).unknown(false);

export const editBookingSchema = Joi.object({
  id: Joi.string().required(),
  participantsEmployeeIds: Joi.array<string>().optional(),
  startsAt: Joi.string().optional(),
  endsAt: Joi.string().optional(),
  status: Joi.string()
    .allow(...Object.values(BookingStatus))
    .optional(),
}).unknown(false);

export const createRoomSchema = Joi.object({
  name: Joi.string().required(),
  maxCapacity: Joi.number().min(1).required(),
  location: Joi.string().required(),
  availableFrom: Joi.string().required(),
  minBookingIntervalInMinutes: Joi.number().min(15).required(),
  price: Joi.number().min(0).required(),
}).unknown(false);

export const editRoomSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().optional(),
  maxCapacity: Joi.number().min(1).optional(),
  location: Joi.string().optional(),
  availableFrom: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
}).unknown(false);
