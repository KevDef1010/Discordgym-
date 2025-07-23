#!/bin/bash

# 🎭 DiscordGym - Role-based User Creator

echo "🎭 Creating DiscordGym Users with Different Roles..."

API_URL="http://localhost:3000/auth/register"

# Check server
if ! curl -s -f "$API_URL" >/dev/null 2>&1; then
    echo "❌ Server not running! Start with: npm start"
    exit 1
fi

echo "✅ Server is running!"

# Role-based users array
declare -a role_users=(
    "guildowner:owner@discord.com:owner123:SUPER_ADMIN"
    "serveradmin:admin@discord.com:admin123:ADMIN"
    "chatmoderator:chatmod@discord.com:mod123:MODERATOR"
    "fitnessexpert:expert@gym.com:expert123:TRAINER"
    "premiumuser:premium@vip.com:vip123:PREMIUM_USER"
    "regularmember:regular@member.com:member123:MEMBER"
    "guestuser:guest@temp.com:guest123:GUEST"
)

echo ""
echo "🏗️ Creating users with roles..."

for user_data in "${role_users[@]}"; do
    IFS=':' read -ra ADDR <<< "$user_data"
    username="${ADDR[0]}"
    email="${ADDR[1]}"
    password="${ADDR[2]}"
    role="${ADDR[3]}"
    
    echo "👤 Creating $username as $role"
    
    result=$(curl -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\",\"role\":\"$role\"}" \
        -s)
    
    # Extract message (simplified)
    if [[ $result == *"successful"* ]]; then
        echo "   ✅ $username created successfully"
    else
        echo "   ❌ Failed to create $username"
    fi
    
    echo ""
    sleep 0.3
done

echo ""
echo "🎉 Role-based users created!"
echo ""
echo "📊 View users with roles:"
echo "   curl http://localhost:3000/users | jq '.[] | {username, role}'"
echo ""
echo "🌐 Prisma Studio: http://localhost:5555"
