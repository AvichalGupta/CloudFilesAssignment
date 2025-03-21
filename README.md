# CloudFilesAssignment

## Overview
This repository is a NestJS-based application that manages room bookings along with users, lenders, and organisations. The system allows different roles to interact with the application to perform actions such as room creation, booking, and more.

## Prerequisites
- Node.js (>= 22.x)
- npm

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Change directory to the project:
   ```
   cd CloudFilesAssignment
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application
To run the application in development mode:
```
npm run start:dev
```
By default, the server runs on port 3000.

## Testing the Application

### Lender Flow
1. **Sign Up as Lender:** Use the sign-up endpoint to create a lender account.
2. **Login as Lender:** Log in using lender credentials.
3. **Create a Room:** After logging in as a lender, create a new room via the appropriate endpoint.

### Organisation Flow
1. **Sign Up as Organisation:** Register as an organisation to generate an organisation ID (orgId).

### User Flow
1. **Sign Up as User:** Register a new user account.
2. **Login as User:** Log in using user credentials.
3. **Book Rooms:** Once logged in, book available rooms.

## Room Slots Update Logic

- When a room is deleted, its available slots and subsequent bookings are also deleted.
- When a room's availableFrom is updated, the available slots are recalculated. Any bookings that were made for a date that is before the new availableFrom and after the old availableFrom will be deleted. All other bookings will remain intact.

## API Endpoints

### Authentication
- **POST /auth/signup**: Register a new account. Accepts role-specific details (lender, organisation, or user) and returns a token upon successful creation.
- **POST /auth/login**: Authenticate a user and provide an access token for authorized endpoints.

### Rooms API
- **POST /rooms**: Create a new room.
  - **Description:** Endpoint for lenders to create a room. Accepts room details such as name, description, capacity, amenities, and location.
  - **Use Case:** Adding a new room to the system for future bookings.
- **GET /rooms**: Retrieve a list of all rooms.
  - **Description:** Returns all available rooms for viewing.
  - **Use Case:** Allows lenders and users to see available rooms for management or booking.
- **GET /rooms/:id**: Retrieve detailed information about a specific room.
  - **Description:** Provides full details of a room including availability, amenities, and current booking status.
  - **Use Case:** Viewing room information prior to booking or for administrative review.
- **PUT /rooms/:id**: Update room information.
  - **Description:** Enables lenders to modify room data such as features, pricing, or availability.
  - **Use Case:** Adjusting details of a room when changes occur or errors need correcting.
- **DELETE /rooms/:id**: Delete a room.
  - **Description:** Removes a room from the system.
  - **Use Case:** Deleting rooms that are no longer available or needed.

### Bookings API
- **POST /bookings**: Create a new booking.
  - **Description:** Allows authenticated users to reserve a room by providing booking dates and preferences.
  - **Use Case:** Reserving a room for a specified time period.
- **GET /bookings**: Retrieve a list of bookings.
  - **Description:** Returns all bookings for the authenticated user, or all bookings for an administrator.
  - **Use Case:** Reviewing current and past booking activities.
- **GET /bookings/:id**: Retrieve detailed information about a specific booking.
  - **Description:** Shows complete details of a booking including room information, booking dates, and status.
  - **Use Case:** Checking the specifics of a particular booking.
- **PUT /bookings/:id**: Update a booking.
  - **Description:** Allows changes to booking details, such as date adjustments or room modifications.
  - **Use Case:** Modifying a booking when plans change.
- **DELETE /bookings/:id**: Cancel a booking.
  - **Description:** Enables users to cancel a booking, freeing up the room.
  - **Use Case:** Releasing a previously reserved room if the booking is no longer needed.

### Additional Endpoints
- **Lenders API:** Endpoints within the `src/lenders` module manage lender-specific operations such as retrieving account details and handling room management tasks.
- **Organisations API:** Endpoints in the `src/organisations` module handle organisation registration and management, primarily used during sign-up to generate an orgId.
- **Users API:** Endpoints in the `src/users` module focus on managing user details and facilitating booking-related operations.

## Conclusion
This project supports multiple roles — lender, organisation, and user — and provides comprehensive APIs for room management and bookings. The endpoints detailed above cover room creation, updating, deletion, and complete CRUD operations for bookings. Follow the testing steps to simulate the flow:
- First, sign up as a lender, log in, and create a room.
- Then, sign up as an organisation to create an orgId.
- Finally, sign up as a user, log in, and book rooms.

POSTMAN LINK:
https://elements.getpostman.com/redirect?entityId=9020780-9f9547f1-e95e-4062-8bbd-a769336b44c8&entityType=collection
