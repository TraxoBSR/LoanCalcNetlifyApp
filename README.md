# Business Loan Calculator

A comprehensive full-stack business loan calculator designed for analyzing business acquisitions with multiple funding sources including SBA loans, seller notes, and other financing options.

## Features

### Frontend (React + TypeScript + Redux)
- **Multi-source funding calculator** with support for:
  - SBA Loans (configurable terms and rates)
  - Seller Notes (with optional interest-only periods)
  - Other Loans (flexible terms)
  - Down Payment (auto-calculated)

- **Flexible SDE forecasting**:
  - Single amount for all years
  - Year 1 + annual growth rate
  - Individual amounts per year (up to 10 years)

- **Professional results dashboard**:
  - Interactive charts using Recharts
  - 10-year financial projections table
  - Key metrics and risk assessment
  - DSCR analysis with visual indicators

- **Email gating system**:
  - User registration with name and email
  - Usage tracking (5 free reports per email)
  - Excel report generation and email delivery

### Backend (Node.js + Express + PostgreSQL)
- RESTful API endpoints for calculations
- User management and usage tracking
- Excel report generation using ExcelJS
- Email automation with Nodemailer
- PostgreSQL database for data persistence
- Rate limiting and security features

## Technology Stack

- **Frontend**: React 18, Redux Toolkit, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL with connection pooling
- **Email**: Nodemailer with SMTP
- **Deployment**: Netlify (frontend), Render (backend + database)

## Getting Started

### Frontend Development
```bash
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@hostname:port/database_name
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

## Database Setup

### Using Render Free Tier

1. **Create PostgreSQL Database on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"
   - Choose free tier
   - Note the connection details

2. **Configure Environment Variables**:
   - Copy the `DATABASE_URL` from Render
   - Update your backend `.env` file

3. **Initialize Database**:
   ```bash
   cd backend
   npm run migrate
   ```

The application will automatically create all required tables and indexes.

## API Endpoints

### User Management
- `POST /api/user/validate` - Validate user and check usage limits
- `POST /api/user/check-usage` - Check current usage for an email

### Calculations
- `POST /api/calculator/submit-inputs` - Store calculation inputs and results
- `GET /api/calculator/history/:email` - Get calculation history

### Reports
- `POST /api/report/request` - Generate and email Excel report
- `GET /api/report/history/:email` - Get report history

## Key Calculations

- **Loan Amortization**: Monthly payment calculations with support for interest-only periods
- **DSCR Analysis**: Debt Service Coverage Ratio tracking
- **Cash Flow Projections**: 10-year financial modeling
- **Risk Assessment**: Automated risk scoring based on financial metrics

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-app.onrender.com/api`

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard
6. Create PostgreSQL database and use connection string

### Database (Render PostgreSQL)
1. Create PostgreSQL database on Render (free tier)
2. Copy the `DATABASE_URL` connection string
3. Add to backend environment variables
4. Database tables will be created automatically on first run

## Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (not your regular password)
3. Use the App Password in `SMTP_PASS` environment variable

## Usage Limits

- 5 free reports per email address
- Usage tracking stored in PostgreSQL
- Automatic email delivery with Excel attachments
- Professional report formatting with charts and tables

## Security Features

- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Helmet.js security headers
- Environment variable protection

## License

MIT License - see LICENSE file for details