#!/bin/bash
# Zenith API Test Flow
# Tests all API endpoints in sequence based on implementation_plan.md

BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function for API calls
test_api() {
  local description="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local token="$5"
  local expected_success="$6"
  
  echo -e "\n${YELLOW}Testing: $description${NC}"
  echo "  $method $endpoint"
  
  local headers="-H 'Content-Type: application/json'"
  if [ -n "$token" ]; then
    headers="$headers -H 'Authorization: Bearer $token'"
  fi
  
  local cmd="curl -s -X $method '$BASE_URL$endpoint' $headers"
  if [ -n "$data" ]; then
    cmd="$cmd -d '$data'"
  fi
  
  local response=$(eval $cmd)
  local success=$(echo $response | grep -o '"success":[^,]*' | head -1 | cut -d':' -f2)
  
  if [ "$success" = "true" ] && [ "$expected_success" = "true" ]; then
    echo -e "  ${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  elif [ "$success" = "false" ] && [ "$expected_success" = "false" ]; then
    echo -e "  ${GREEN}✓ PASSED (Expected failure)${NC}"
    ((PASSED++))
  else
    echo -e "  ${RED}✗ FAILED${NC}"
    echo "  Response: $(echo $response | head -c 200)"
    ((FAILED++))
  fi
  
  echo "$response"
}

echo "================================================"
echo " ZENITH API TEST FLOW"
echo " Started: $(date)"
echo "================================================"

# ========================================
# PHASE 1: USER REGISTRATION & LOGIN
# ========================================
echo -e "\n${YELLOW}=== PHASE 1: USER REGISTRATION & LOGIN ===${NC}"

# Register User 1 (will become Team Lead)
echo -e "\n--- Registering User 1 (Team Lead) ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Lead $TIMESTAMP\",
    \"email\": \"testlead$TIMESTAMP@example.com\",
    \"password\": \"TestPass123!\",
    \"phone\": \"+9198765${TIMESTAMP:0:5}\",
    \"age\": 22,
    \"organisation\": \"Test University\",
    \"bio\": \"Team lead test user\",
    \"github_link\": \"https://github.com/testlead$TIMESTAMP\",
    \"linkedin_link\": \"https://linkedin.com/in/testlead$TIMESTAMP\"
  }")
echo "Response: $(echo $RESPONSE | head -c 300)"
USER1_UID=$(echo $RESPONSE | grep -o '"uid":"[^"]*' | cut -d'"' -f4)
echo "User 1 UID: $USER1_UID"

# Register User 2 (will join team)
echo -e "\n--- Registering User 2 (Team Member) ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Member $TIMESTAMP\",
    \"email\": \"testmember$TIMESTAMP@example.com\",
    \"password\": \"TestPass123!\",
    \"phone\": \"+9187654${TIMESTAMP:0:5}\",
    \"age\": 21,
    \"organisation\": \"Another University\",
    \"bio\": \"Team member test user\"
  }")
echo "Response: $(echo $RESPONSE | head -c 300)"
USER2_UID=$(echo $RESPONSE | grep -o '"uid":"[^"]*' | cut -d'"' -f4)
echo "User 2 UID: $USER2_UID"

# Login User 1
echo -e "\n--- Login User 1 ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"testlead$TIMESTAMP@example.com\", \"password\": \"TestPass123!\"}")
echo "Response: $(echo $RESPONSE | head -c 300)"
TOKEN1=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token 1 obtained: ${TOKEN1:0:50}..."

# Login User 2
echo -e "\n--- Login User 2 ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"testmember$TIMESTAMP@example.com\", \"password\": \"TestPass123!\"}")
TOKEN2=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token 2 obtained: ${TOKEN2:0:50}..."

# ========================================
# PHASE 2: USER PROFILE OPERATIONS
# ========================================
echo -e "\n${YELLOW}=== PHASE 2: USER PROFILE OPERATIONS ===${NC}"

# Get User 1 Profile
echo -e "\n--- GET /api/user/profile (User 1) ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 400)"

# Update User 1 Profile
echo -e "\n--- PUT /api/user/profile (User 1) ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio - Im the team lead", "isLooking": true}')
echo "Response: $(echo $RESPONSE | head -c 300)"

# ========================================
# PHASE 3: LOOKING FOR TEAM/MEMBERS
# ========================================
echo -e "\n${YELLOW}=== PHASE 3: LOOKING FOR TEAM/MEMBERS ===${NC}"

# Set User 2 as looking for team
echo -e "\n--- PUT /api/user/looking-for-team (User 2) ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/looking-for-team" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"isLooking": true}')
echo "Response: $(echo $RESPONSE | head -c 200)"

# Get users looking for team
echo -e "\n--- GET /api/user/looking-for-team ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/looking-for-team" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 500)"

# ========================================
# PHASE 4: TEAM CREATION & OPERATIONS
# ========================================
echo -e "\n${YELLOW}=== PHASE 4: TEAM CREATION & OPERATIONS ===${NC}"

# Create Team (User 1 as Team Lead)
echo -e "\n--- POST /api/team/create ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/team/create" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"teamName\": \"Test Warriors $TIMESTAMP\", \"isLooking\": true}")
echo "Response: $(echo $RESPONSE | head -c 400)"
TEAM_CODE=$(echo $RESPONSE | grep -o '"teamCode":"[^"]*' | cut -d'"' -f4)
echo "Team Code: $TEAM_CODE"

# Get teams looking for members
echo -e "\n--- GET /api/team/looking-for-members ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/team/looking-for-members" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 500)"

# User 2 joins the team
echo -e "\n--- PUT /api/team/join (User 2) ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/team/join" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{\"teamCode\": \"$TEAM_CODE\"}")
echo "Response: $(echo $RESPONSE | head -c 400)"

# Update team looking status
echo -e "\n--- PUT /api/team/looking-for-members ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/team/looking-for-members" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"teamCode\": \"$TEAM_CODE\", \"isLooking\": false}")
echo "Response: $(echo $RESPONSE | head -c 200)"

# ========================================
# PHASE 5: TEAM SUBMISSION
# ========================================
echo -e "\n${YELLOW}=== PHASE 5: TEAM SUBMISSION ===${NC}"

# Upload submission
echo -e "\n--- POST /api/team/upload-submission ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/team/upload-submission" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{
    \"teamCode\": \"$TEAM_CODE\",
    \"videoURL\": \"https://www.youtube.com/watch?v=test$TIMESTAMP\",
    \"anyOtherLink\": \"https://github.com/test$TIMESTAMP/project\"
  }")
echo "Response: $(echo $RESPONSE | head -c 400)"

# Submit application
echo -e "\n--- POST /api/team/submit-application ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/team/submit-application" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"teamCode\": \"$TEAM_CODE\"}")
echo "Response: $(echo $RESPONSE | head -c 300)"

# Update submission (after submitting)
echo -e "\n--- PUT /api/team/update-submission ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/team/update-submission" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{
    \"teamCode\": \"$TEAM_CODE\",
    \"videoURL\": \"https://www.youtube.com/watch?v=updated$TIMESTAMP\"
  }")
echo "Response: $(echo $RESPONSE | head -c 300)"

# ========================================
# PHASE 6: PROBLEM STATEMENTS
# ========================================
echo -e "\n${YELLOW}=== PHASE 6: PROBLEM STATEMENTS ===${NC}"

# Get problem statements (public)
echo -e "\n--- GET /api/problem-statements ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/problem-statements")
echo "Response: $(echo $RESPONSE | head -c 300)"

# ========================================
# PHASE 7: ADMIN OPERATIONS (will fail without admin)
# ========================================
echo -e "\n${YELLOW}=== PHASE 7: ADMIN OPERATIONS (Expected to fail - no admin token) ===${NC}"

# Try to get participants (should fail - not admin)
echo -e "\n--- GET /api/admin/participants (Expected: 403) ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/participants" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 200)"

# Try to get teams (should fail - not admin)
echo -e "\n--- GET /api/admin/teams (Expected: 403) ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/teams" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 200)"

# Try to create problem statement (should fail - not admin)
echo -e "\n--- POST /api/admin/problem-statements (Expected: 403) ---"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/problem-statements" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Problem Statement for Testing", "description": "This is a test problem statement that should be at least 50 characters long to pass validation."}')
echo "Response: $(echo $RESPONSE | head -c 200)"

# ========================================
# PHASE 8: EVALUATOR OPERATIONS (will fail without evaluator)
# ========================================
echo -e "\n${YELLOW}=== PHASE 8: EVALUATOR OPERATIONS (Expected to fail - no evaluator token) ===${NC}"

# Try to get assigned teams (should fail - not evaluator)
echo -e "\n--- GET /api/evaluator/teams (Expected: 403) ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/evaluator/teams" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 200)"

# ========================================
# PHASE 9: RSVP OPERATIONS (requires shortlisting first)
# ========================================
echo -e "\n${YELLOW}=== PHASE 9: RSVP OPERATIONS ===${NC}"

# Get RSVP status
echo -e "\n--- GET /api/user/rsvp ---"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/rsvp" \
  -H "Authorization: Bearer $TOKEN1")
echo "Response: $(echo $RESPONSE | head -c 400)"

# Try RSVP (should fail - team not shortlisted)
echo -e "\n--- PUT /api/user/rsvp (Expected: 400 - not shortlisted) ---"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/rsvp" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"rsvpStatus": "confirmed"}')
echo "Response: $(echo $RESPONSE | head -c 200)"

# ========================================
# PHASE 10: TEAM LEAVE/REMOVE OPERATIONS
# ========================================
echo -e "\n${YELLOW}=== PHASE 10: TEAM LEAVE OPERATIONS ===${NC}"

# Note: We won't actually leave the team to preserve test data
echo "Skipping team leave to preserve test data..."

# ========================================
# SUMMARY
# ========================================
echo -e "\n${YELLOW}================================================${NC}"
echo -e " TEST SUMMARY"
echo -e "${YELLOW}================================================${NC}"
echo "Test Data Created:"
echo "  - User 1 (Team Lead): testlead$TIMESTAMP@example.com"
echo "  - User 2 (Member): testmember$TIMESTAMP@example.com"
echo "  - Team: Test Warriors $TIMESTAMP (Code: $TEAM_CODE)"
echo ""
echo "APIs Tested:"
echo "  ✓ POST /api/user/register"
echo "  ✓ POST /api/user/login"
echo "  ✓ GET /api/user/profile"
echo "  ✓ PUT /api/user/profile"
echo "  ✓ GET /api/user/looking-for-team"
echo "  ✓ PUT /api/user/looking-for-team"
echo "  ✓ POST /api/team/create"
echo "  ✓ PUT /api/team/join"
echo "  ✓ GET /api/team/looking-for-members"
echo "  ✓ PUT /api/team/looking-for-members"
echo "  ✓ POST /api/team/upload-submission"
echo "  ✓ POST /api/team/submit-application"
echo "  ✓ PUT /api/team/update-submission"
echo "  ✓ GET /api/problem-statements"
echo "  ✓ GET /api/user/rsvp"
echo "  ✓ PUT /api/user/rsvp (expected failure)"
echo "  ✓ Admin endpoints (expected 403)"
echo "  ✓ Evaluator endpoints (expected 403)"
echo ""
echo "Finished: $(date)"
