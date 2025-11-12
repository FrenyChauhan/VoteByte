# Candidate Feature - Testing Guide & Sample Data

## Sample User Data (for testing)

```javascript
// User 1: Regular Voter who wants to be a candidate
{
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "USER",
  "phone_number": "+91-9876543210",
  "gender": "MALE",
  "date_of_birth": "1990-05-15",
  "address": "123 Main Street, City",
  "profile_photo": "https://res.cloudinary.com/.../john-profile.jpg"
}

// User 2: Election Creator
{
  "fullname": "Sarah Johnson",
  "email": "sarah.election@example.com",
  "password": "ElectionAdmin123!",
  "role": "USER",
  "phone_number": "+91-9876543211",
  "gender": "FEMALE",
  "date_of_birth": "1985-03-20",
  "address": "456 Election Ave, City",
  "profile_photo": "https://res.cloudinary.com/.../sarah-profile.jpg"
}

// User 3: Another Voter Candidate
{
  "fullname": "Michael Chen",
  "email": "michael.chen@example.com",
  "password": "CandidatePass456!",
  "role": "USER",
  "phone_number": "+91-9876543212",
  "gender": "MALE",
  "date_of_birth": "1988-07-10",
  "address": "789 Civic Lane, City",
  "profile_photo": "https://res.cloudinary.com/.../michael-profile.jpg"
}
```

## Sample Election Data

```javascript
{
  "title": "Mayor Election 2025",
  "description": "Election for the position of Mayor in City Municipality",
  "start_time": "2025-12-01T08:00:00Z",
  "end_time": "2025-12-01T18:00:00Z",
  "authType": "AADHAR"
}
```

## Sample Candidate Registration Data

### Candidate 1: Register John Doe
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "{election_id}",
  "party_name": "Progressive Alliance",
  "symbol": "🎯",
  "manifesto": "Our vision is to build a modern, transparent, and citizen-centric city administration. We focus on infrastructure development, healthcare improvement, and educational excellence.",
  "age": 35,
  "qualification": "Bachelor's Degree in Public Administration"
}

// Response (201 Created):
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": {
    "candidate_id": "550e8400-e29b-41d4-a716-446655440001",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440010",
    "party_name": "Progressive Alliance",
    "symbol": "🎯",
    "manifesto": "Our vision is to build a modern, transparent, and citizen-centric city administration...",
    "age": 35,
    "qualification": "Bachelor's Degree in Public Administration",
    "total_votes": 0,
    "status": "PENDING",
    "registered_at": "2025-11-12T10:30:00.000Z",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440010",
      "fullname": "John Doe",
      "email": "john.doe@example.com",
      "profile_photo": "https://res.cloudinary.com/.../john-profile.jpg"
    }
  }
}
```

### Candidate 2: Register Michael Chen
```javascript
POST /api/candidates/register
Authorization: Bearer {michael_token}

{
  "election_id": "{election_id}",
  "party_name": "Citizens United",
  "symbol": "🏛️",
  "manifesto": "We believe in grassroots governance and direct community participation. Our key priorities include reducing corruption, improving public services, and sustainable urban development.",
  "age": 37,
  "qualification": "Master's Degree in Urban Planning"
}

// Response (201 Created):
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": {
    "candidate_id": "550e8400-e29b-41d4-a716-446655440002",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "party_name": "Citizens United",
    "symbol": "🏛️",
    "status": "PENDING",
    ...
  }
}
```

## Test Workflows

### Workflow 1: Complete Approval Flow

#### Step 1: Register as Candidate
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}
Content-Type: application/json

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  "party_name": "Progressive Alliance",
  "symbol": "🎯",
  "manifesto": "Building a better city for everyone",
  "age": 35,
  "qualification": "Bachelor's in Public Administration"
}

// Expected Response: 201 Created
// Candidate Status: PENDING
```

#### Step 2: Election Creator Views Pending Candidates
```javascript
GET /api/candidates/election/550e8400-e29b-41d4-a716-446655440000/pending
Authorization: Bearer {sarah_token}

// Expected Response: 200 OK
// Returns: Array of pending candidates
```

#### Step 3: Election Creator Approves Candidate
```javascript
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440001/approve
Authorization: Bearer {sarah_token}

// Expected Response: 200 OK
// Candidate Status: APPROVED
```

#### Step 4: Public Views Approved Candidates
```javascript
GET /api/candidates/election/550e8400-e29b-41d4-a716-446655440000/approved
// No authentication required

// Expected Response: 200 OK
[
  {
    "candidate_id": "550e8400-e29b-41d4-a716-446655440001",
    "party_name": "Progressive Alliance",
    "symbol": "🎯",
    "manifesto": "Building a better city for everyone",
    "age": 35,
    "total_votes": 0,
    "user": {
      "fullname": "John Doe",
      "profile_photo": "url"
    }
  }
]
```

### Workflow 2: Rejection Flow

#### Step 1: Register Candidate
```javascript
POST /api/candidates/register
Authorization: Bearer {michael_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  "party_name": "Test Party",
  "symbol": "💔",
  "age": 25,
  "qualification": "High School"
}

// Response: candidate_id = 550e8400-e29b-41d4-a716-446655440003
```

#### Step 2: Election Creator Rejects Candidate
```javascript
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440003/reject
Authorization: Bearer {sarah_token}
Content-Type: application/json

{
  "reason": "Qualifications do not meet minimum requirements"
}

// Expected Response: 200 OK
// Candidate Status: REJECTED
```

#### Step 3: Verify Rejection
```javascript
GET /api/candidates/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer {michael_token}

// Expected Response: 200 OK
// Status: REJECTED
```

### Workflow 3: Update Pending Candidate

#### Step 1: Register with Initial Data
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  "party_name": "Old Party Name",
  "symbol": "❌",
  "age": 30,
  "qualification": "Basic"
}

// Response: candidate_id = 550e8400-e29b-41d4-a716-446655440004
```

#### Step 2: Update Before Approval
```javascript
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440004
Authorization: Bearer {john_token}
Content-Type: application/json

{
  "party_name": "New Party Name",
  "symbol": "✅",
  "manifesto": "Updated manifesto content",
  "qualification": "Master's Degree"
}

// Expected Response: 200 OK
// Candidate updated with new values
```

#### Step 3: Cannot Update After Approval
```javascript
// First approve the candidate
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440004/approve
Authorization: Bearer {sarah_token}

// Then try to update
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440004
Authorization: Bearer {john_token}

{
  "party_name": "Another Party"
}

// Expected Response: 400 Bad Request
// Message: "Can only update pending candidate registrations"
```

## Test Cases for Error Handling

### Test Case 1: Duplicate Registration
```javascript
// First registration
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}

// Second registration for same election
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}

// Expected Response: 409 Conflict
// Message: "User is already registered as a candidate for this election"
```

### Test Case 2: Missing Required Fields
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  // Missing: party_name, symbol, age, qualification
  "party_name": "Test Party"
}

// Expected Response: 400 Bad Request
// Message: "Missing required fields: symbol, age, qualification"
```

### Test Case 3: Invalid Age
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  "party_name": "Test Party",
  "symbol": "🎯",
  "age": 200,  // Invalid: > 149
  "qualification": "Bachelor's"
}

// Expected Response: 400 Bad Request
// Message: "Invalid candidate data: Valid age is required (between 1 and 149)"
```

### Test Case 4: Invalid Election
```javascript
POST /api/candidates/register
Authorization: Bearer {john_token}

{
  "election_id": "invalid-uuid",
  "party_name": "Test Party",
  "symbol": "🎯",
  "age": 35,
  "qualification": "Bachelor's"
}

// Expected Response: 404 Not Found
// Message: "Election not found"
```

### Test Case 5: Unauthorized Approval
```javascript
// John tries to approve Michael's candidate
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440002/approve
Authorization: Bearer {john_token}

// Expected Response: 403 Forbidden
// Message: "Forbidden: Only election creator can approve candidates"
```

### Test Case 6: Unauthorized Update (Not Owner)
```javascript
// Sarah tries to update John's candidate
PUT /api/candidates/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer {sarah_token}

{
  "party_name": "Hacked Party"
}

// Expected Response: 403 Forbidden
// Message: "Unauthorized: Can only update your own candidate profile"
```

## Statistics & Analytics Test

### Get Candidate Statistics
```javascript
GET /api/candidates/election/550e8400-e29b-41d4-a716-446655440000/stats

// Expected Response:
{
  "success": true,
  "message": "Candidate statistics fetched successfully",
  "data": {
    "total": 10,
    "approved": 7,
    "pending": 2,
    "rejected": 1
  }
}
```

## Public Profile Access Test

### Get Candidate Profile (Public)
```javascript
GET /api/candidates/550e8400-e29b-41d4-a716-446655440001/profile
// No authentication required

// Expected Response: 200 OK
{
  "success": true,
  "message": "Candidate profile fetched successfully",
  "data": {
    "candidate_id": "550e8400-e29b-41d4-a716-446655440001",
    "party_name": "Progressive Alliance",
    "symbol": "🎯",
    "manifesto": "Building a better city for everyone",
    "age": 35,
    "qualification": "Bachelor's in Public Administration",
    "total_votes": 250,
    "status": "APPROVED",
    "user": {
      "fullname": "John Doe",
      "profile_photo": "url"
    }
  }
}
```

### Access Non-Approved Profile
```javascript
// Try to access pending candidate profile
GET /api/candidates/550e8400-e29b-41d4-a716-446655440004/profile

// Expected Response: 404 Not Found
// Message: "Candidate profile not available"
```

## Postman Collection Template

```json
{
  "info": {
    "name": "Candidate Feature Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register as Candidate",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/candidates/register",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"election_id\": \"{{election_id}}\", \"party_name\": \"Test Party\", \"symbol\": \"🎯\", \"age\": 35, \"qualification\": \"Bachelor's\"}"
        }
      }
    },
    {
      "name": "Get Approved Candidates",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/candidates/election/{{election_id}}/approved"
      }
    },
    {
      "name": "Approve Candidate",
      "request": {
        "method": "PUT",
        "url": "{{baseUrl}}/api/candidates/{{candidate_id}}/approve",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{creator_token}}"
          }
        ]
      }
    }
  ]
}
```

## Performance Testing

### Load Test: Approve 100 Candidates
```bash
# For each candidate ID in list
for candidateId in $(seq 1 100); do
  curl -X PUT \
    "http://localhost:3000/api/candidates/$candidateId/approve" \
    -H "Authorization: Bearer {creator_token}"
done
```

### Concurrent Requests: Register 10 Candidates
```bash
# Use GNU Parallel or similar
parallel --jobs 10 'curl -X POST ... -d "election_id: $1"' ::: {1..10}
```

## Expected Behavior Summary

| Action | Status | Auth | Result |
|--------|--------|------|--------|
| Register | Pending | User | ✅ Created |
| Register (duplicate) | Pending | User | ❌ 409 Conflict |
| View Own | Any | User | ✅ Allowed |
| View Approved | Any | Public | ✅ Allowed |
| View Pending | Pending | Creator | ✅ Allowed |
| View Pending | Pending | Other User | ❌ 403 Forbidden |
| Approve | Pending | Creator | ✅ Approved |
| Approve | Pending | Non-Creator | ❌ 403 Forbidden |
| Update | Pending | Owner | ✅ Updated |
| Update | Pending | Non-Owner | ❌ 403 Forbidden |
| Update | Approved | Owner | ❌ 400 Bad Request |
| Delete | Pending | Owner | ✅ Deleted |
| Delete | Pending | Non-Owner | ❌ 403 Forbidden |

---

**Ready for Testing!** 🚀

Use these examples to test all features and edge cases of the Candidate system.
