# Candidate Feature Documentation

## Overview
The Candidate feature allows users to register as candidates for elections, enables election creators to approve/reject candidates, and provides public access to candidate profiles. The feature follows OOP principles with a Model-Service-Controller (MSC) architecture and includes role-based access control (RBAC).

## Architecture

### 1. **Candidate Model** (`models/Candidate.js`)
Object-oriented representation of a candidate with validation logic.

**Key Methods:**
- `isValid()` - Validates candidate data
- `getValidationErrors()` - Returns array of validation errors
- `isApproved()` - Checks if candidate is approved
- `isPending()` - Checks if candidate is pending approval
- `isRejected()` - Checks if candidate is rejected
- `toJSON()` - Returns full candidate data (authenticated users)
- `toPublicJSON()` - Returns candidate data for public view (hides sensitive info)

**Properties:**
- `candidate_id` - UUID primary key
- `election_id` - Reference to election
- `user_id` - Reference to user profile
- `party_name` - Political party name
- `symbol` - Party symbol/logo
- `manifesto` - Campaign manifesto
- `age` - Candidate age (1-149)
- `qualification` - Educational qualification
- `total_votes` - Vote count
- `status` - PENDING, APPROVED, or REJECTED
- `registered_at` - Registration timestamp

### 2. **CandidateService** (`services/candidateService.js`)
Implements business logic for candidate operations.

**Key Methods:**

| Method | Description | Auth |
|--------|-------------|------|
| `registerCandidate(data, userId)` | Register user as candidate | Authenticated User |
| `approveCandidate(candidateId, creatorId)` | Approve candidate | Election Creator |
| `rejectCandidate(candidateId, creatorId, reason)` | Reject candidate | Election Creator |
| `getCandidatesByElection(electionId, status)` | Get candidates for election | Public |
| `getApprovedCandidates(electionId)` | Get approved candidates | Public |
| `getPendingCandidates(electionId)` | Get pending candidates | Public |
| `getCandidateById(candidateId)` | Get single candidate | Public |
| `getCandidateProfile(candidateId)` | Get public profile | Public |
| `getCandidatesByUser(userId)` | Get user's candidates | Authenticated |
| `getCandidateStats(electionId)` | Get approval statistics | Public |
| `updateCandidate(candidateId, data, userId)` | Update pending registration | Candidate Owner |
| `deleteCandidate(candidateId, userId)` | Delete pending registration | Candidate Owner |

**Features:**
- Transaction-based operations for data consistency
- Automatic vote count management
- Election status validation
- Duplicate registration prevention
- User authorization checks

### 3. **CandidateController** (`controllers/candidateController.js`)
Handles HTTP requests and delegates to service layer.

**Endpoints:**
- `POST /register` - Register as candidate
- `PUT /:candidateId/approve` - Approve candidate
- `PUT /:candidateId/reject` - Reject candidate
- `GET /election/:electionId` - Get all candidates (election creator only)
- `GET /election/:electionId/pending` - Get pending candidates
- `GET /election/:electionId/approved` - Get approved candidates (public)
- `GET /election/:electionId/stats` - Get statistics
- `GET /:candidateId` - Get candidate details
- `GET /:candidateId/profile` - Get public profile
- `GET /my-candidates` - Get user's candidates
- `PUT /:candidateId` - Update candidate
- `DELETE /:candidateId` - Delete candidate

**Error Handling:**
- Validates all inputs
- Maps service errors to appropriate HTTP status codes
- Returns consistent ApiResponse format

### 4. **RBAC Middleware** (`middlewares/rbacMiddleware.js`)
Role-based access control for protected routes.

**Middleware Functions:**

#### `rbacMiddleware(allowedRoles)`
Restricts access based on user roles.

```javascript
// Usage in routes
router.post('/admin-only', authMiddleware, rbacMiddleware(['SUPERADMIN']), controller);
```

#### `isElectionCreator(req, res, next)`
Verifies user is the election creator.

```javascript
// Usage in routes
router.put('/:candidateId/approve', authMiddleware, isElectionCreator, controller);
```

#### `isSuperAdmin(req, res, next)`
Verifies user is superadmin.

```javascript
// Usage in routes
router.delete('/system-candidate/:id', authMiddleware, isSuperAdmin, controller);
```

### 5. **Routes** (`routes/candidate.js`)
Clean route organization with proper middleware application.

**Route Structure:**
```
/api/candidates
├── Public Routes (No Auth)
│   ├── GET  /election/:electionId/approved
│   ├── GET  /:candidateId/profile
│   └── GET  /election/:electionId/stats
├── Authenticated Routes
│   ├── POST /register
│   ├── GET  /my-candidates
│   ├── PUT  /:candidateId
│   ├── DELETE /:candidateId
│   ├── GET  /:candidateId
├── Election Creator Routes
│   ├── GET  /election/:electionId
│   ├── GET  /election/:electionId/pending
│   ├── PUT  /:candidateId/approve
│   └── PUT  /:candidateId/reject
```

## API Endpoints

### 1. Register as Candidate
```http
POST /api/candidates/register
Content-Type: application/json
Authorization: Bearer {token}

{
  "election_id": "uuid",
  "party_name": "Party Name",
  "symbol": "🎯",
  "manifesto": "Our vision and goals...",
  "age": 35,
  "qualification": "Bachelor's Degree in Science"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": {
    "candidate_id": "uuid",
    "election_id": "uuid",
    "user_id": "uuid",
    "party_name": "Party Name",
    "symbol": "🎯",
    "status": "PENDING",
    "registered_at": "2025-11-12T10:30:00Z",
    "user": {
      "user_id": "uuid",
      "fullname": "John Doe",
      "email": "john@example.com",
      "profile_photo": "url"
    }
  }
}
```

### 2. Approve Candidate
```http
PUT /api/candidates/{candidateId}/approve
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate approved successfully",
  "data": {
    "candidate_id": "uuid",
    "status": "APPROVED"
  }
}
```

### 3. Reject Candidate
```http
PUT /api/candidates/{candidateId}/reject
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Qualifications do not meet requirements"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate rejected successfully",
  "data": {
    "candidate_id": "uuid",
    "status": "REJECTED"
  }
}
```

### 4. Get Approved Candidates for Election
```http
GET /api/candidates/election/{electionId}/approved
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Approved candidates fetched successfully",
  "data": [
    {
      "candidate_id": "uuid",
      "party_name": "Party A",
      "symbol": "🎯",
      "total_votes": 1250,
      "user": {
        "fullname": "John Doe",
        "profile_photo": "url"
      }
    }
  ]
}
```

### 5. Get Pending Candidates (Election Creator Only)
```http
GET /api/candidates/election/{electionId}/pending
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending candidates fetched successfully",
  "data": [
    {
      "candidate_id": "uuid",
      "party_name": "Party B",
      "status": "PENDING",
      "registered_at": "2025-11-12T10:30:00Z"
    }
  ]
}
```

### 6. Get My Candidates
```http
GET /api/candidates/my-candidates
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Your candidates fetched successfully",
  "data": [
    {
      "candidate_id": "uuid",
      "election_id": "uuid",
      "status": "APPROVED"
    }
  ]
}
```

### 7. Get Candidate Statistics
```http
GET /api/candidates/election/{electionId}/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate statistics fetched successfully",
  "data": {
    "total": 15,
    "approved": 10,
    "pending": 3,
    "rejected": 2
  }
}
```

### 8. Get Candidate Profile (Public)
```http
GET /api/candidates/{candidateId}/profile
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate profile fetched successfully",
  "data": {
    "candidate_id": "uuid",
    "party_name": "Party A",
    "symbol": "🎯",
    "manifesto": "Our vision...",
    "age": 35,
    "qualification": "Bachelor's Degree",
    "total_votes": 1250
  }
}
```

### 9. Update Candidate (Pending Only)
```http
PUT /api/candidates/{candidateId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "party_name": "Updated Party Name",
  "symbol": "🎪",
  "manifesto": "Updated manifesto..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "data": { ... }
}
```

### 10. Delete Candidate (Pending Only)
```http
DELETE /api/candidates/{candidateId}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully",
  "data": null
}
```

## Data Validation

### Candidate Registration
| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `election_id` | UUID | Required, must exist | `"uuid"` |
| `party_name` | String | Required | `"Democratic Party"` |
| `symbol` | String | Required | `"🎯"` |
| `manifesto` | String | Optional | `"Our vision..."` |
| `age` | Number | Required, 1-149 | `35` |
| `qualification` | String | Required | `"Bachelor's Degree"` |

### Status Flow
```
PENDING (initial)
  ├→ APPROVED (election creator action)
  └→ REJECTED (election creator action)
```

## RBAC & Authorization

### Role-Based Access Control

| Feature | VOTER | HOST | ADMIN | SuperAdmin |
|---------|-------|------|-------|-----------|
| Register as candidate | ✅ | ✅ | ✅ | ✅ |
| View own candidates | ✅ | ✅ | ✅ | ✅ |
| View approved candidates | ✅ | ✅ | ✅ | ✅ |
| Approve candidates | ❌ | ❌ | ✅* | ✅ |
| Reject candidates | ❌ | ❌ | ✅* | ✅ |
| View pending candidates | ❌ | ❌ | ✅* | ✅ |
| Update own candidate | ✅ | ✅ | ✅ | ✅ |
| Delete own candidate | ✅ | ✅ | ✅ | ✅ |

*Only for their election

### Authorization Checks
1. **Candidate Owner**: Can update/delete only their own pending registrations
2. **Election Creator**: Can approve/reject/view pending candidates for their elections
3. **Superadmin**: System-level access to all operations
4. **Public**: Can view approved candidates and profiles

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: party_name, age, qualification"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Only election creator can approve candidates"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User is already registered as a candidate for this election"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to register candidate: {error details}"
}
```

## Business Logic Rules

1. **Duplicate Prevention**: A user cannot register as a candidate for the same election twice
2. **Election Status**: Users can only register for elections that are UPCOMING or ONGOING
3. **Approval Flow**: All new registrations start in PENDING status
4. **Candidate Ownership**: Users can only modify their own pending registrations
5. **Vote Tracking**: Total vote count is automatically managed by the system
6. **Count Management**: Total candidates count updates when candidates are approved/rejected
7. **Public View**: Only approved candidates are visible to the public
8. **Profile Data**: Sensitive information (email) is hidden in public views

## Integration with Other Features

### With Elections
- Candidates are bound to specific elections
- Cannot register for completed/cancelled elections
- Total candidates count is maintained in election record

### With Users
- Each candidate must have a valid user account
- User profile photo is included in candidate data
- User email is available to authenticated requests

### With Voting
- Approved candidates can receive votes
- Vote count is displayed on candidate profiles
- Candidates are ranked by votes

### With Authentication
- All protected routes use JWT authentication
- User ID is extracted from JWT token
- Authorization checks use user ID and role

## Testing Guide

### Test Scenarios

#### 1. Register as Candidate
```javascript
// Test Case: Valid registration
POST /api/candidates/register
{
  "election_id": "election-uuid",
  "party_name": "Test Party",
  "symbol": "🎯",
  "manifesto": "Test manifesto",
  "age": 30,
  "qualification": "Bachelor's"
}
// Expected: 201 Created

// Test Case: Duplicate registration
// Expected: 409 Conflict
```

#### 2. Approval Flow
```javascript
// 1. Register candidate → Status: PENDING
// 2. Election creator approves → Status: APPROVED
// 3. Candidate visible in public list
// 4. Can receive votes
```

#### 3. Permission Tests
```javascript
// Test: Non-creator cannot approve
// Test: Candidate cannot approve others
// Test: Only owner can update pending
// Expected: 403 Forbidden for unauthorized
```

## Performance Considerations

1. **Database Indexes**: Ensure indexes on:
   - `candidate.election_id`
   - `candidate.user_id`
   - `candidate.status`

2. **Query Optimization**:
   - Batch operations for large elections
   - Pagination for candidate lists (recommended for >100 candidates)
   - Caching for public candidate lists

3. **Vote Counting**:
   - Aggregated count in database
   - Update on vote cast
   - Periodic reconciliation for accuracy

## Future Enhancements

1. Candidate profile images
2. Candidate rankings/leaderboard
3. Candidate withdrawal during voting
4. Candidate performance analytics
5. Batch approval workflows
6. Candidate messaging system
7. Appeal mechanism for rejections
8. Candidate verification badges

## File Structure

```
backend/
├── models/
│   └── Candidate.js              # Candidate OOP model
├── services/
│   └── candidateService.js       # Business logic layer
├── controllers/
│   └── candidateController.js    # Request handling
├── routes/
│   └── candidate.js              # Route definitions
├── middlewares/
│   └── rbacMiddleware.js         # Authorization checks
└── app.js                         # Candidate route registration
```

## Database Schema Integration

Ensure your Prisma schema includes:

```prisma
model Candidate {
  candidate_id  String   @id @db.Uuid
  election_id   String   @db.Uuid
  user_id       String?  @db.Uuid
  party_name    String
  symbol        String
  manifesto     String?
  age           Int
  qualification String
  total_votes   Int      @default(0)
  status        CandidateStatus
  registered_at DateTime @default(now())

  user          User?     @relation(fields: [user_id], references: [user_id])
  election      Election  @relation("candidates_in_election", fields: [election_id], references: [election_id])
}

enum CandidateStatus {
  APPROVED
  PENDING
  REJECTED
}
```

## Dependencies

- `@prisma/client` - ORM
- `crypto` - UUID generation
- `express` - Framework (via existing setup)

All dependencies already installed in your project!

---

**Last Updated**: November 12, 2025  
**Status**: Production Ready ✅
