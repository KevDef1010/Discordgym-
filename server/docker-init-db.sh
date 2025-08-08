#!/bin/bash
echo "🚀 Starting database initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
npx prisma migrate status
while [ $? -ne 0 ]; do
  echo "   Database not ready, waiting 2 seconds..."
  sleep 2
  npx prisma migrate status
done

echo "✅ Database connection established!"

# Push schema to database
echo "📊 Pushing Prisma schema to database..."
npx prisma db push

# Generate Prisma Client
echo "🛠️ Generating Prisma Client..."
npx prisma generate

# Check if we have seed data
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
  echo "🌱 Running database seeding..."
  npx prisma db seed || echo "⚠️ Seeding failed or no seed script found"
fi

echo "🎉 Database initialization completed!"
echo ""
echo "📊 Database Status:"
npx prisma migrate status || echo "No migrations found (using db push)"

echo ""
echo "🚀 Starting NestJS application..."
exec "$@"
