# Password Reset Backend - README

This document outlines the setup, configuration, and API endpoints for the password reset backend, including instructions for testing the APIs using Postman.

---

## Prerequisites

1. Node.js installed on your system.
2. MongoDB set up and running (locally or via a cloud service like MongoDB Atlas).
3. Postman for API testing.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd password-reset-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
MONGO_URI=<your-mongo-db-connection-string>
EMAIL_USER=<your-email-address>
EMAIL_PASS=<your-email-password>
RESET_TOKEN_EXPIRY=3600000 # Token validity in milliseconds (1 hour)
```

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`.

---

## API Endpoints

### 1. **User Registration**

**Endpoint**: `/api/auth/register`

* **Method**: POST
* **Description**: Register a new user.
* **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
* **Response**:

  * `201 Created`: User successfully registered.
  * `400 Bad Request`: Validation error or email already exists.

### 2. **Forgot Password**

**Endpoint**: `/api/auth/forgot-password`

* **Method**: POST
* **Description**: Generate a reset password token and send it via email.
* **Request Body**:

  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Response**:

  * `200 OK`: Email sent with reset link.
  * `404 Not Found`: Email not found in the database.

### 3. **Reset Password Form**

**Endpoint**: `/api/auth/reset-password/:token`

* **Method**: GET
* **Description**: Validate the reset token.
* **Path Parameter**:

  * `:token`: The reset token sent via email.
* **Response**:

  * `200 OK`: Token is valid.
  * `400 Bad Request`: Token is invalid or expired.

### 4. **Reset Password**

**Endpoint**: `/api/auth/reset-password/:token`

* **Method**: POST
* **Description**: Reset the user's password.
* **Path Parameter**:

  * `:token`: The reset token sent via email.
* **Request Body**:

  ```json
  {
    "password": "newPassword123"
  }
  ```
* **Response**:

  * `200 OK`: Password successfully updated.
  * `400 Bad Request`: Token is invalid or expired.
  * `404 Not Found`: User not found.

---

## Postman Testing Scenarios

### Collection Setup

1. Create a new Postman collection named **Password Reset API**.
2. Add the following requests to the collection.

### 1. Register User

* **Request Type**: POST
* **URL**: `http://localhost:3000/api/auth/register`
* **Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### 2. Forgot Password

* **Request Type**: POST
* **URL**: `http://localhost:3000/api/auth/forgot-password`
* **Body**:

  ```json
  {
    "email": "user@example.com"
  }
  ```

### 3. Reset Password (Validate Token)

* **Request Type**: GET
* **URL**: `http://localhost:3000/api/auth/reset-password/<token>`
* Replace `<token>` with the token received via email.

### 4. Reset Password (Update Password)

* **Request Type**: POST
* **URL**: `http://localhost:3000/api/auth/reset-password/<token>`
* **Body**:

  ```json
  {
    "password": "newPassword123"
  }
  ```

---

## Notes

1. Ensure the email credentials provided in `.env` are valid.
2. The reset token has an expiry time defined by the `RESET_TOKEN_EXPIRY` variable in `.env`.
3. Use Mailtrap or Ethereal for testing email functionality in development.
4. Validate all API responses in Postman to ensure the flow works as expected.

---

## Troubleshooting

* **Database Connection Issues**: Check the `MONGO_URI` in the `.env` file.
* **Email Not Sent**: Verify `EMAIL_USER` and `EMAIL_PASS` credentials.
* **Token Expiry**: Ensure the token has not expired (default is 1 hour).

---

## Future Enhancements

1. Add rate limiting for the forgot password endpoint to prevent abuse.
2. Integrate with a frontend for a complete user experience.
3. Implement multi-factor authentication for enhanced security.

---

