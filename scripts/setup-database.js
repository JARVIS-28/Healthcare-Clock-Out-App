const { PrismaClient } = require('@prisma/client')

async function setupDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Connecting to Supabase database...')
    
    // Test the connection
    await prisma.$connect()
    console.log('✅ Successfully connected to Supabase database!')
    
    // Check if we can query the database
    const result = await prisma.$queryRaw`SELECT version();`
    console.log('📊 Database version:', result[0].version)
    
    console.log('\n📋 Next steps:')
    console.log('1. Replace [YOUR-PASSWORD] in .env.local with your actual Supabase password')
    console.log('2. Run: npx prisma db push (to create tables)')
    console.log('3. Run: npx prisma studio (to view/manage data)')
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Please check:')
      console.log('- Replace [YOUR-PASSWORD] with your actual Supabase password in .env.local')
      console.log('- Ensure your Supabase project is active')
      console.log('- Check that your IP is allowed in Supabase settings')
    }
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
