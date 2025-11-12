# Candidate Feature - Quick Reference Guide

## 🚀 Quick Start

### 1. Register as Candidate
```bash
curl -X POST http://localhost:3000/api/candidates/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "election_id": "election-uuid",
    "party_name": "Your Party",
    "symbol": "🎯",
    "manifesto": "Your vision here",
    "age": 35,
    "qualification": "Bachelor'\''s Degree"
  }'
```

### 2. View Approved Candidates
```bash
curl http://localhost:3000/api/candidates/election/election-uuid/approved
```

### 3. Approve Candidate (Creator Only)
```bash
curl -X PUT http://localhost:3000/api/candidates/candidate-uuid/approve \
  -H "Authorization: Bearer CREATOR_TOKEN"
```

## 📋 All Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/candidates/register` | ✅ | Register as candidate |
| GET | `/candidates/my-candidates` | ✅ | View your candidates |
| PUT | `/candidates/:id` | ✅ | Update your candidate |
| DELETE | `/candidates/:id` | ✅ | Delete your candidate |
| GET | `/candidates/:id` | ✅ | View candidate details |
| PUT | `/candidates/:id/approve` | ✅ Creator | Approve candidate |
| PUT | `/candidates/:id/reject` | ✅ Creator | Reject candidate |
| GET | `/candidates/election/:electionId` | ✅ Creator | View all candidates |
| GET | `/candidates/election/:electionId/pending` | ✅ Creator | View pending |
| GET | `/candidates/election/:electionId/approved` | ❌ | View approved |
| GET | `/candidates/:id/profile` | ❌ | View public profile |
| GET | `/candidates/election/:electionId/stats` | ❌ | View statistics |

## 🔑 Key Concepts

### Status Flow
```
PENDING → APPROVED → (receives votes)
       ↘ REJECTED
```

### Who Can Do What?
```
Register:     ✅ Any authenticated user
Approve:      ✅ Election creator only
Reject:       ✅ Election creator only
Update:       ✅ Candidate owner (if pending)
Delete:       ✅ Candidate owner (if pending)
View Own:     ✅ Candidate owner
View Public:  ✅ Everyone (approved only)
```

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| `party_name` | Required, max 255 chars |
| `symbol` | Required, emoji or short string |
| `age` | Required, 1-149 |
| `qualification` | Required, min 2 chars |
| `manifesto` | Optional |

## 🛡️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 409 | Duplicate registration |
| 500 | Server error |

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## 🧪 Test Commands

### Register
```bash
curl -X POST http://localhost:3000/api/candidates/register \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "election_id": "id",
    "party_name": "Party",
    "symbol": "🎯",
    "age": 35,
    "qualification": "Degree"
  }'
```

### Get My Candidates
```bash
curl http://localhost:3000/api/candidates/my-candidates \
  -H "Authorization: Bearer token"
```

### Get Approved Candidates
```bash
curl http://localhost:3000/api/candidates/election/election-id/approved
```

### Approve Candidate
```bash
curl -X PUT http://localhost:3000/api/candidates/candidate-id/approve \
  -H "Authorization: Bearer creator-token"
```

### Get Statistics
```bash
curl http://localhost:3000/api/candidates/election/election-id/stats
```

## 📁 Important Files

| File | Lines | Purpose |
|------|-------|---------|
| `models/Candidate.js` | 116 | OOP model with validation |
| `services/candidateService.js` | 522 | Business logic |
| `controllers/candidateController.js` | 350 | Request handling |
| `routes/candidate.js` | 57 | API endpoints |
| `middlewares/rbacMiddleware.js` | 90 | Authorization |
| `CANDIDATE_FEATURE_DOCS.md` | 600+ | Full documentation |
| `CANDIDATE_TEST_DATA.md` | 400+ | Test scenarios |

## 🔐 Authorization Matrix

| Role | Can Approve | Can View Pending | Can Reject |
|------|-----------|------------------|-----------|
| Regular User | ❌ | ❌ | ❌ |
| Election Creator | ✅* | ✅* | ✅* |
| SuperAdmin | ✅ | ✅ | ✅ |

*For their elections only

## 📈 Common Workflows

### Approve a Candidate
1. User registers → Status: PENDING
2. Election creator views pending
3. Creator approves → Status: APPROVED
4. Candidate now visible to public
5. Can receive votes

### Reject a Candidate
1. User registers → Status: PENDING
2. Election creator views pending
3. Creator rejects → Status: REJECTED
4. Candidate no longer visible
5. Cannot be modified

### Update Registration
1. User registers → Status: PENDING
2. User updates info (before approval)
3. Election creator approves updated info
4. Status: APPROVED

## 🔍 Debugging Tips

### Check if registered
```bash
curl http://localhost:3000/api/candidates/my-candidates \
  -H "Authorization: Bearer token"
```

### Verify election exists
```bash
curl http://localhost:3000/api/elections/election-id
```

### Check duplicate registration
Try registering again → Should get 409 Conflict

### Verify approver is creator
Use election creator's token for approve endpoint

### Check candidate status
```bash
curl http://localhost:3000/api/candidates/candidate-id \
  -H "Authorization: Bearer token"
```

## 💡 Tips & Tricks

1. **Public Profile**: Use `/candidates/:id/profile` for frontend display
2. **Vote Count**: Automatically updated from voting system
3. **Statistics**: Use `/stats` endpoint for dashboard
4. **Batch Approve**: Write script using the approve endpoint
5. **My Candidates**: Users can track their registrations
6. **Update Before Approval**: Users can edit while pending
7. **Delete Option**: Users can withdraw pending registrations

## ⚠️ Common Mistakes

❌ Using wrong election ID  
✅ Copy exact UUID from election creation

❌ Trying to approve without being creator  
✅ Use election creator's token

❌ Trying to update after approval  
✅ Updates only work for PENDING status

❌ Registering twice for same election  
✅ One candidate per user per election

❌ Invalid age (> 149 or < 1)  
✅ Use realistic age between 18-100

## 📞 Support Articles

### Q: How do I register as a candidate?
A: POST to `/candidates/register` with required fields and auth token

### Q: Can I update my candidate info?
A: Yes, but only while status is PENDING. After approval, no changes allowed.

### Q: How are candidates approved?
A: Election creator must approve using `/candidates/:id/approve` endpoint

### Q: Can users see pending candidates?
A: No, only election creator can see pending. Public sees only approved.

### Q: What's the vote count?
A: Automatically tracked in the system. View in candidate details or stats.

### Q: Can I delete my candidate?
A: Yes, but only while status is PENDING

### Q: How do I see all candidates for an election?
A: As creator: `/election/:id` (all) | As public: `/election/:id/approved`

## 🚦 Status Indicators

- 🟡 **PENDING**: Awaiting approval
- 🟢 **APPROVED**: Visible and can receive votes
- 🔴 **REJECTED**: Not eligible for election

## 📊 Statistics Response
```json
{
  "total": 15,      // All candidates
  "approved": 10,   // Approved
  "pending": 3,     // Awaiting approval
  "rejected": 2     // Rejected
}
```

## 🎯 Next Steps

1. ✅ Test all endpoints with provided commands
2. ✅ Verify approval workflow works
3. ✅ Test authorization (try unauthorized actions)
4. ✅ Check validation (try invalid data)
5. ✅ Integrate with frontend
6. ✅ Deploy to production

---

**Last Updated**: November 12, 2025  
**Version**: 1.0  
**All Features**: ✅ Complete
