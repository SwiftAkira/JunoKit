#!/bin/bash

# Junokit User Pool Cleanup Script
# This script helps identify and remove unused Cognito User Pools

set -e

echo "🧹 Junokit User Pool Cleanup"
echo "============================"

# The user pool we're actually using (from config)
ACTIVE_USER_POOL="eu-north-1_QUaZ7e7OU"

echo "✅ Active User Pool (DO NOT DELETE): $ACTIVE_USER_POOL"
echo ""

# List of user pools to check
USER_POOLS_TO_CHECK=(
    "eu-north-1_gOj2e6lp3"
    "eu-north-1_rN2UQpNdP"
)

echo "🔍 Checking unused user pools..."
echo ""

for pool_id in "${USER_POOLS_TO_CHECK[@]}"; do
    echo "Checking User Pool: $pool_id"
    
    # Check if user pool exists
    if aws cognito-idp describe-user-pool --user-pool-id "$pool_id" >/dev/null 2>&1; then
        echo "  ✅ User pool exists"
        
        # Check if it has any users
        user_count=$(aws cognito-idp list-users --user-pool-id "$pool_id" --query 'length(Users)' --output text 2>/dev/null || echo "0")
        echo "  👥 Users in pool: $user_count"
        
        # Check if it has any app clients
        client_count=$(aws cognito-idp list-user-pool-clients --user-pool-id "$pool_id" --query 'length(UserPoolClients)' --output text 2>/dev/null || echo "0")
        echo "  📱 App clients: $client_count"
        
        if [ "$user_count" = "0" ] && [ "$client_count" = "0" ]; then
            echo "  🗑️  SAFE TO DELETE (no users, no clients)"
            echo ""
            read -p "  Delete user pool $pool_id? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "  🗑️  Deleting user pool $pool_id..."
                aws cognito-idp delete-user-pool --user-pool-id "$pool_id"
                echo "  ✅ Deleted successfully"
            else
                echo "  ⏭️  Skipped deletion"
            fi
        else
            echo "  ⚠️  NOT SAFE TO DELETE (has users or clients)"
        fi
    else
        echo "  ❌ User pool does not exist (already deleted or invalid ID)"
    fi
    echo ""
done

echo "🎉 Cleanup complete!"
echo ""
echo "📋 Summary:"
echo "- Active user pool: $ACTIVE_USER_POOL"
echo "- This user pool contains your demo user and is used by the application"
echo "- Only empty user pools were offered for deletion"
echo ""
echo "🔗 Next steps:"
echo "1. Verify your application still works: http://localhost:3001"
echo "2. Test login with demo@junokit.com / TempPass123!"
echo "3. Continue with Phase 4 Step 3 (AI Integration)" 