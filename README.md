# Healthcare Clock App

A modern time tracking application for healthcare workers with location-based perimeter checking, real-time analytics, and manager dashboard capabilities.

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd Clock-out-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

### Deploy to Production
```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Or see DEPLOYMENT.md for detailed instructions
```

## 🚀 Features Implemented

### Core Features
- **User Authentication**: Mock authentication system (Auth0 integration ready)
- **Location-Based Clock In/Out**: GPS location detection with perimeter validation
- **Role-Based Access Control**: Care Worker, Manager, and Admin roles
- **Real-time Dashboard**: Manager dashboard with key metrics
- **Responsive Design**: Mobile-first design using Ant Design components
- **Progressive Web App**: PWA capabilities with offline support

### Care Worker Features
- ✅ Clock in/out functionality with location detection
- ✅ Location perimeter checking (2km radius default)
- ✅ Optional notes when clocking in/out
- ✅ View personal time tracking history
- ✅ Real-time location status updates

### Manager Features
- ✅ Dashboard with analytics (average hours, daily clock-ins, active users)
- ✅ View all clocked-in staff in real-time
- ✅ Staff management and role updates
- ✅ Organization perimeter management
- ✅ Time tracking reports and analytics

### Technical Features
- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Ant Design UI components
- ✅ GraphQL API with Apollo Server
- ✅ Prisma ORM with PostgreSQL schema
- ✅ React Context for state management
- ✅ Geolocation API integration
- ✅ PWA manifest and service worker ready

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Ant Design**: Professional UI component library
- **React Context**: State management (as requested, no Redux)
- **Apollo Client**: GraphQL client

### Backend
- **GraphQL**: API query language with Apollo Server
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Primary database
- **Auth0**: User authentication (configured but using mock for demo)

### DevOps & Tools
- **ESLint**: Code linting
- **Tailwind CSS**: Utility-first CSS framework
- **Next PWA**: Progressive Web App capabilities

## 📱 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/graphql/       # GraphQL API endpoint
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/
│   └── providers/         # React providers
├── contexts/              # React Context for state management
├── lib/                   # Utility libraries
│   ├── apollo-client.ts   # Apollo GraphQL client
│   └── graphql-queries.ts # GraphQL queries and mutations
└── prisma/
    └── schema.prisma      # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Auth0 account (optional for demo)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clock-out-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.local` and update with your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/clock_out_app"
   
   # Auth0 Configuration
   AUTH0_SECRET='your-secret-here'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
   AUTH0_CLIENT_ID='your-auth0-client-id'
   AUTH0_CLIENT_SECRET='your-auth0-client-secret'
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses a PostgreSQL database with the following key models:

- **User**: Healthcare workers with role-based permissions
- **Organization**: Hospital/clinic with location perimeter settings
- **ClockEntry**: Time tracking records with GPS coordinates
- **AnalyticsSummary**: Pre-aggregated daily analytics data

## 🔧 API Endpoints

### GraphQL API (`/api/graphql`)
- **Queries**: User data, clock entries, analytics, location validation
- **Mutations**: Clock in/out, user management, perimeter settings

Key operations:
- `clockIn(input)` - Clock in with location validation
- `clockOut(input)` - Clock out with location data
- `checkLocationPerimeter(lat, lng)` - Validate user location
- `getDashboardStats()` - Manager dashboard metrics

## 📱 PWA Features

- **Installable**: Can be installed on home screen
- **Offline Ready**: Basic offline functionality
- **Responsive**: Works on mobile and desktop
- **App-like Experience**: Standalone display mode

## 🧪 Demo Features

The current implementation includes:
- Mock authentication system (click "Login with Auth0")
- Real geolocation detection
- Interactive clock in/out functionality
- Manager dashboard with sample data
- Responsive design for mobile and desktop

## 🔮 Future Enhancements

### Bonus Features Ready for Implementation
- **Automatic Notifications**: When entering/leaving perimeter
- **Advanced Analytics**: Chart.js integration for data visualization
- **Offline Sync**: Queue actions when offline
- **Photo Verification**: Camera integration for clock in/out
- **Shift Scheduling**: Integration with work schedules

## 📈 Performance Considerations

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Apollo Client caching for GraphQL
- **Database Optimization**: Prisma query optimization

## 🔒 Security Features

- **Role-Based Access**: Manager/Care Worker permissions
- **Location Validation**: Server-side perimeter checking
- **Input Sanitization**: GraphQL type validation
- **Authentication Ready**: Auth0 integration prepared

## 📚 Documentation

- **API Documentation**: GraphQL schema with detailed types
- **Component Documentation**: TypeScript interfaces
- **Database Schema**: Prisma schema with relationships
- **Deployment Guide**: Ready for Vercel/Netlify deployment

## 🚀 Deployment

The application is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Heroku**
- **Railway**

Environment variables need to be configured in the deployment platform.

## 📝 License

This project is built as a demonstration for healthcare time tracking solutions.

---

**Built with ❤️ for healthcare workers**
