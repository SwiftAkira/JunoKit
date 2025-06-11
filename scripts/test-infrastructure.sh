#!/bin/bash

# Junokit Infrastructure Testing Script
# Tests all deployed AWS resources in Stockholm (eu-north-1)

set -e  # Exit on error

echo "🧪 Testing Junokit Infrastructure in Stockholm (eu-north-1)"
echo "============================================================"

REGION="eu-north-1"
SUCCESS_COUNT=0
TOTAL_TESTS=0

# Test function
test_service() {
    local service_name="$1"
    local test_command="$2"
    local success_pattern="$3"
    
    echo "Testing $service_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /tmp/test_output 2>&1; then
        if [[ -z "$success_pattern" ]] || grep -q "$success_pattern" /tmp/test_output; then
            echo "✅ $service_name: PASSED"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo "❌ $service_name: FAILED (output doesn't match pattern)"
            cat /tmp/test_output
        fi
    else
        echo "❌ $service_name: FAILED (command error)"
        cat /tmp/test_output
    fi
    echo ""
}

echo "1. Testing AWS CLI Configuration"
echo "--------------------------------"
test_service "AWS Identity" "aws sts get-caller-identity --region $REGION" "Account"

echo "2. Testing DynamoDB"
echo "-------------------"
test_service "DynamoDB Table List" "aws dynamodb list-tables --region $REGION" "junokit-user-context"
test_service "DynamoDB Table Details" "aws dynamodb describe-table --table-name junokit-user-context --region $REGION" "ACTIVE"

echo "3. Testing Cognito"
echo "------------------"
test_service "Cognito User Pool" "aws cognito-idp describe-user-pool --user-pool-id eu-north-1_QUaZ7e7OU --region $REGION" "junokit-users"
test_service "Cognito User Pool Client" "aws cognito-idp describe-user-pool-client --user-pool-id eu-north-1_QUaZ7e7OU --client-id 66ako4srqdk2aghompd956bloa --region $REGION" "junokit-web-client"

echo "4. Testing API Gateway"
echo "----------------------"
test_service "API Gateway List" "aws apigateway get-rest-apis --region $REGION" "junokit-api"

echo "5. Testing Secrets Manager"
echo "---------------------------"
test_service "Secrets Manager" "aws secretsmanager describe-secret --secret-id junokit-api-secrets --region $REGION" "junokit-api-secrets"

echo "6. Testing SES"
echo "--------------"
test_service "SES Identities" "aws ses list-identities --region $REGION" "junokit.com"

echo "7. Testing CloudWatch"
echo "----------------------"
test_service "CloudWatch Log Groups" "aws logs describe-log-groups --log-group-name-prefix /aws/lambda/junokit --region $REGION" "/aws/lambda/junokit"

echo "8. Testing IAM"
echo "--------------"
test_service "Lambda Execution Role" "aws iam get-role --role-name junokit-lambda-execution-role" "junokit-lambda-execution-role"

echo "9. Testing CloudFormation Stack"
echo "--------------------------------"
test_service "CloudFormation Stack" "aws cloudformation describe-stacks --stack-name JunokitInfraStack --region $REGION" "CREATE_COMPLETE"

echo "============================================================"
echo "🎯 Infrastructure Test Results"
echo "============================================================"
echo "Tests Passed: $SUCCESS_COUNT/$TOTAL_TESTS"

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo "🎉 ALL TESTS PASSED! Infrastructure is fully operational!"
    echo ""
    echo "📊 Live Infrastructure Summary:"
    echo "• DynamoDB Table: junokit-user-context (ACTIVE)"
    echo "• Cognito User Pool: eu-north-1_QUaZ7e7OU (ACTIVE)"
    echo "• API Gateway: https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/ (LIVE)"
    echo "• Secrets Manager: junokit-api-secrets (READY)"
    echo "• SES Domain: junokit.com (CONFIGURED)"
    echo "• CloudWatch Logs: /aws/lambda/junokit (READY)"
    echo "• IAM Role: junokit-lambda-execution-role (ACTIVE)"
    echo ""
    echo "✅ Ready for Phase 3: Frontend Development!"
else
    echo "⚠️  Some tests failed. Review the output above."
    exit 1
fi

# Cleanup
rm -f /tmp/test_output 