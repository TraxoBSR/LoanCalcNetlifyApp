# Business Loan Calculator Backend

This is the backend API for the Business Loan Calculator application, built with Node.js, Express, and PostgreSQL.

## Features

- **User Management**: Registration, validation, and usage tracking
- **Calculation Storage**: Store and retrieve loan calculations
- **Report Generation**: Generate and email Excel reports
- **Usage Limits**: Track and enforce 5 free reports per email
- **Email Integration**: Send detailed Excel reports via email

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration (from Render)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=https://your-frontend-app.netlify.app
```

### 3. Database Setup

The application will automatically create the required tables when it starts. You can also run the migration manually:

```bash
npm run migrate
```

### 4. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### 5. Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `cd backend && npm install`
4. Set the start command: `cd backend && npm start`
5. Add environment variables in Render dashboard
6. Create a PostgreSQL database on Render and use the connection string

## API Endpoints

### User Management
- `POST /api/user/validate` - Validate user and check usage limits
- `POST /api/user/check-usage` - Check current usage for an email

### Calculations
- `POST /api/calculator/submit-inputs` - Store calculation inputs and results
- `GET /api/calculator/history/:email` - Get calculation history for a user

### Reports
- `POST /api/report/request` - Generate and email Excel report
- `GET /api/report/history/:email` - Get report history for a user

### Health Check
- `GET /health` - Server health check

## Database Schema

### Tables
- `users` - User information (name, email)
- `user_usage` - Usage tracking (report count, limits)
- `calculations` - Stored calculation inputs and results
- `reports` - Report generation tracking

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run database migration
npm run migrate
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use secure JWT secret
3. Configure proper CORS origins
4. Set up SSL/TLS for database connections
5. Configure email service credentials
6. Set appropriate rate limits

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS configuration
- Environment variable protection

## Monitoring

The application includes:
- Request/response logging
- Database query logging
- Error tracking
- Health check endpoint
- Graceful shutdown handling