# Supabase Database Setup

## Quick Setup Steps

1. **Update Environment Variables**
   - Open `.env.local`
   - Replace `[YOUR-PASSWORD]` with your actual Supabase database password
   - Your Supabase connection details are already configured

2. **Test Database Connection**
   ```bash
   npm run db:setup
   ```

3. **Create Database Tables**
   ```bash
   npm run db:push
   ```

4. **View Database (Optional)**
   ```bash
   npm run db:studio
   ```

## Environment Variables Configured

Your `.env.local` now includes:

```bash
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.pdttorgvykpyeaytszxm:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pdttorgvykpyeaytszxm:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

## Database Schema

The healthcare clock app includes tables for:
- **Users** (care workers, managers)
- **ClockEvents** (clock in/out records)
- **Locations** (perimeter definitions)
- **WorkSessions** (calculated work periods)

## Useful Commands

- `npm run db:setup` - Test database connection
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Create and run migrations
- `npm run db:reset` - Reset database (development only)

## Troubleshooting

### Connection Issues
- Ensure your Supabase project is active
- Check that your IP address is allowed in Supabase settings
- Verify the password is correct (no [YOUR-PASSWORD] placeholder)

### Migration Issues
- Use `npm run db:push` for development
- Use `npm run db:migrate` for production-like workflows

## Next Steps

After setting up the database:
1. The healthcare app will automatically connect
2. User authentication will work with stored user data
3. Clock in/out events will be persisted
4. Manager analytics will show real data

Your healthcare clock app is now ready for production use with Supabase!
