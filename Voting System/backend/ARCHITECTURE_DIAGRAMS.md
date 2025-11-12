# Candidate Feature - Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│              (Frontend / Postman / API Client)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES LAYER                             │
│            (routes/candidate.js)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Public Routes (no auth)                            │   │
│  │ • Authenticated Routes (JWT required)                │   │
│  │ • Protected Routes (role-based)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
              Middleware Stack
         authMiddleware, rbacMiddleware
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               CONTROLLERS LAYER                             │
│         (controllers/candidateController.js)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Request validation                                 │   │
│  │ • Parameter extraction                               │   │
│  │ • Delegate to services                               │   │
│  │ • Map errors to HTTP responses                       │   │
│  │ • Use ApiResponse utility                            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
              Calls Service Layer
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                SERVICES LAYER                               │
│          (services/candidateService.js)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • CandidateService class                             │   │
│  │ • Business logic implementation                      │   │
│  │ • Candidate validation                               │   │
│  │ • Authorization checks                               │   │
│  │ • Database operations                                │   │
│  │ • Error handling                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
           Creates/Uses Models
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  MODELS LAYER                               │
│              (models/Candidate.js)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Candidate class                                    │   │
│  │ • Data encapsulation                                 │   │
│  │ • Validation methods                                 │   │
│  │ • Status checking helpers                            │   │
│  │ • JSON serialization (full & public)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
             Uses Prisma Client
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE LAYER                              │
│            (PostgreSQL + Prisma ORM)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Candidate table                                    │   │
│  │ • Foreign keys to User & Election                    │   │
│  │ • CandidateStatus enum                               │   │
│  │ • Indexes on election_id, user_id, status            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### 1. Register as Candidate Flow
```
User Request
    ↓
POST /api/candidates/register
    ↓
✓ Extract: election_id, party_name, symbol, age, qualification
    ↓
✓ Authenticate (JWT token check)
    ↓
CandidateService.registerCandidate()
    ↓
✓ Create Candidate instance
✓ Validate: isValid()
    ↓
✓ Check: User not already registered
✓ Check: Election exists & not completed
    ↓
Prisma.candidate.create()
    ↓
✓ Store in database (Status: PENDING)
✓ Update election total_candidates
    ↓
Return: New Candidate object
    ↓
ApiResponse.success()
    ↓
HTTP 201 Created → Client
```

### 2. Approve Candidate Flow
```
Election Creator Request
    ↓
PUT /api/candidates/{candidateId}/approve
    ↓
✓ Authenticate (JWT token check)
    ↓
✓ Extract: candidate_id
    ↓
CandidateService.approveCandidate()
    ↓
✓ Check: Candidate exists
✓ Check: Requester is election creator (Admin)
    ↓
Prisma.candidate.update(status: APPROVED)
    ↓
Return: Updated Candidate
    ↓
ApiResponse.success()
    ↓
HTTP 200 OK → Client
    ↓
Candidate now visible in public list & can receive votes
```

### 3. Public View Candidates Flow
```
Public Request (No Auth)
    ↓
GET /api/candidates/election/{electionId}/approved
    ↓
CandidateService.getApprovedCandidates()
    ↓
✓ Query: WHERE status = APPROVED AND election_id = ?
    ↓
✓ Include: user data (name, photo only)
✓ Order by: total_votes DESC
    ↓
Return: Array of Candidates
    ↓
Map to: toPublicJSON() (remove sensitive data)
    ↓
ApiResponse.success()
    ↓
HTTP 200 OK → Client
```

## 🔐 Authorization Flow

```
Request Arrives
    ↓
Check: Is route protected? (authMiddleware)
    ├─ YES → Extract JWT token
    │   ├─ Valid? → Continue
    │   └─ Invalid? → 401 Unauthorized
    └─ NO → Continue to next middleware
    ↓
Check: Is role-based protection? (rbacMiddleware)
    ├─ YES → Check user.role
    │   ├─ Allowed? → Continue
    │   └─ Not allowed? → 403 Forbidden
    └─ NO → Continue to next middleware
    ↓
Check: Special authorization? (isElectionCreator)
    ├─ YES → Check if user is election creator
    │   ├─ YES → Continue
    │   └─ NO → 403 Forbidden
    └─ NO → Continue
    ↓
Execute Controller Handler
    ↓
Return Response
```

## 🔄 Status State Machine

```
                ┌─────────────┐
                │   PENDING   │
                │ (Initial)   │
                └──────┬──────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
     ┌─────────────┐           ┌─────────────┐
     │  APPROVED   │           │  REJECTED   │
     │ (Public)    │           │ (Not Public)│
     │ (Voting)    │           │             │
     └─────────────┘           └─────────────┘
          │
          ↓ (After voting)
     ┌─────────────┐
     │   WINNER    │
     │  (Optional) │
     └─────────────┘
```

## 📋 Request/Response Cycle

```
┌────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                      │
│ ┌──────────────────────────────────────────────────┐   │
│ │ POST /api/candidates/register                    │   │
│ │ Authorization: Bearer eyJhbGc...                 │   │
│ │ {                                                 │   │
│ │   "election_id": "uuid",                         │   │
│ │   "party_name": "Party X",                       │   │
│ │   "symbol": "🎯",                                │   │
│ │   "age": 35,                                     │   │
│ │   "qualification": "Degree"                      │   │
│ │ }                                                 │   │
│ └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE PROCESSING                               │
│ • Parse JSON ✓                                         │
│ • Authenticate (authMiddleware) ✓                      │
│ • Extract user from JWT ✓                              │
│ • Store in req.user ✓                                  │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 3. CONTROLLER                                          │
│ • Validate inputs ✓                                    │
│ • Extract parameters ✓                                 │
│ • Call service ✓                                       │
│ • Handle errors ✓                                      │
│ • Format response ✓                                    │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 4. SERVICE LAYER                                       │
│ • Create Candidate instance ✓                          │
│ • Validate business logic ✓                            │
│ • Check authorization ✓                                │
│ • Perform DB operations ✓                              │
│ • Return result ✓                                      │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 5. DATABASE                                            │
│ • INSERT into candidates table ✓                       │
│ • UPDATE election total_candidates ✓                   │
│ • Commit transaction ✓                                 │
│ • Return created record ✓                              │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 6. RESPONSE BUILDING                                   │
│ • Create Candidate object ✓                            │
│ • Serialize to JSON ✓                                  │
│ • Format with ApiResponse ✓                            │
│ • Set HTTP 201 status ✓                                │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│ 7. CLIENT RECEIVES RESPONSE                            │
│ ┌──────────────────────────────────────────────────┐   │
│ │ HTTP/1.1 201 Created                             │   │
│ │ Content-Type: application/json                   │   │
│ │ {                                                 │   │
│ │   "success": true,                               │   │
│ │   "message": "Candidate registered successfully",│   │
│ │   "data": {                                       │   │
│ │     "candidate_id": "uuid",                      │   │
│ │     "election_id": "uuid",                       │   │
│ │     "party_name": "Party X",                     │   │
│ │     "status": "PENDING",                         │   │
│ │     ...                                           │   │
│ │   }                                               │   │
│ │ }                                                 │   │
│ └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## 🔌 Module Dependencies

```
app.js
├── /routes/candidate.js ────────────────────┐
│                                             │
├── authMiddleware ──────────────────────────┤
│   └── authService.getUserById()            │
│                                             │
├── rbacMiddleware ──────────────────────────┤
│   └── PrismaClient                         │
│                                             │
└── /controllers/candidateController.js ─────┤
    └── /services/candidateService.js ───────┤
        ├── PrismaClient                     │
        ├── /models/Candidate.js             │
        └── crypto.randomUUID()              │
```

## 📈 Candidate Lifecycle

```
Day 1: Election Created
├── Status: UPCOMING
├── Candidates: 0
└── Actions: Accept registrations

Day 2-10: Registration Period
├── Users register
├── Status: PENDING for each
├── Election updates total_candidates
└── Creator reviews submissions

Day 11: Creator Reviews
├── Views pending candidates
├── Approves suitable candidates
├── Rejects unsuitable candidates
├── Status: APPROVED or REJECTED
└── Total_candidates updated

Day 12: Pre-Election
├── Only APPROVED visible to public
├── Voter sees candidate list
├── Vote count: 0 for all
└── Status: UPCOMING

Day 13: Election Starts
├── Status: ONGOING
├── Voting enabled
├── Vote count updates
└── Real-time results

Day 13 Evening: Election Ends
├── Status: COMPLETED
├── Voting disabled
├── Final vote counts locked
├── Winner determined
└── Results published
```

## 🎯 Endpoint Organization

```
/api/candidates/
│
├── PUBLIC ENDPOINTS (No Auth)
│   ├── GET /election/:electionId/approved
│   ├── GET /:candidateId/profile
│   └── GET /election/:electionId/stats
│
├── AUTHENTICATED ENDPOINTS (JWT Required)
│   ├── POST /register
│   ├── GET /my-candidates
│   ├── PUT /:candidateId
│   ├── DELETE /:candidateId
│   └── GET /:candidateId
│
└── CREATOR ENDPOINTS (JWT + Election Creator)
    ├── GET /election/:electionId
    ├── GET /election/:electionId/pending
    ├── PUT /:candidateId/approve
    └── PUT /:candidateId/reject
```

## 💾 Database Relations

```
┌─────────────────┐
│     User        │
│─────────────────│
│ user_id (PK)    │
│ fullname        │
│ email           │
│ profile_photo   │
│ ...             │
└────────┬────────┘
         │ 1
         │
         │ N (has many)
         │
         ▼
┌─────────────────────────┐
│      Candidate          │
│─────────────────────────│
│ candidate_id (PK)       │
│ election_id (FK)        │◄─┐
│ user_id (FK) ──────────┐   │
│ party_name              │   │
│ symbol                  │   │
│ manifesto               │   │
│ age                     │   │
│ qualification           │   │
│ total_votes             │   │
│ status (enum)           │   │
│ registered_at           │   │
└──────────────┬──────────┘   │
               │               │
               │               │
               │           ┌───┴──────────────┐
               │           │   Election      │
               │           │─────────────────│
               │           │ election_id(PK) │
               │           │ title           │
               │           │ status          │
               │           │ start_time      │
               │           │ end_time        │
               │           │ total_voters    │
               │           │ total_candidates◄──(counts updated)
               │           │ ...             │
               │           └─────────────────┘
               │
               └──────(User profile data)
```

## 🔄 Vote Integration Flow

```
Voter Views Candidates
    ↓
GET /api/candidates/election/:electionId/approved
    ↓
Returns: [Candidate with total_votes, ...]
    ↓
Voter clicks candidate to vote
    ↓
POST /api/votes/cast  (Voting system endpoint)
    ├── candidate_id
    └── voter_id
    ↓
Vote recorded
    ↓
Update Candidate.total_votes++
    ↓
Voter sees updated leaderboard
    ↓
GET /api/candidates/election/:electionId/approved
    ↓
Returns: Updated candidate list sorted by votes
```

---

**Visual Guide Created**: November 12, 2025  
**All Diagrams**: ✅ Complete  
**Architecture**: ✅ Clear & Scalable
