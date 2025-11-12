class Candidate {
    constructor({
        candidate_id,
        election_id,
        user_id,
        party_name,
        symbol,
        manifesto,
        age,
        qualification,
        total_votes = 0,
        status = 'PENDING',
        registered_at,
        user = null
    }) {
        this.candidate_id = candidate_id;
        this.election_id = election_id;
        this.user_id = user_id;
        this.party_name = party_name;
        this.symbol = symbol;
        this.manifesto = manifesto;
        this.age = age;
        this.qualification = qualification;
        this.total_votes = total_votes;
        this.status = status; // PENDING, APPROVED, REJECTED
        this.registered_at = registered_at;
        this.user = user;
    }

    isValid() {
        return (
            this.election_id &&
            this.user_id &&
            this.party_name &&
            this.symbol &&
            this.age > 0 &&
            this.age < 150 &&
            this.qualification &&
            ['PENDING', 'APPROVED', 'REJECTED'].includes(this.status)
        );
    }

    getValidationErrors() {
        const errors = [];

        if (!this.election_id) errors.push('Election ID is required');
        if (!this.user_id) errors.push('User ID is required');
        if (!this.party_name) errors.push('Party name is required');
        if (!this.symbol) errors.push('Party symbol is required');
        if (!this.age || this.age <= 0 || this.age >= 150) {
            errors.push('Valid age is required (between 1 and 149)');
        }
        if (!this.qualification) errors.push('Qualification is required');
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(this.status)) {
            errors.push('Invalid candidate status');
        }

        return errors;
    }

    isApproved() {
        return this.status === 'APPROVED';
    }

    isPending() {
        return this.status === 'PENDING';
    }

    isRejected() {
        return this.status === 'REJECTED';
    }

    toJSON() {
        return {
            candidate_id: this.candidate_id,
            election_id: this.election_id,
            user_id: this.user_id,
            party_name: this.party_name,
            symbol: this.symbol,
            manifesto: this.manifesto,
            age: this.age,
            qualification: this.qualification,
            total_votes: this.total_votes,
            status: this.status,
            registered_at: this.registered_at,
            user: this.user ? {
                user_id: this.user.user_id,
                fullname: this.user.fullname,
                email: this.user.email,
                profile_photo: this.user.profile_photo
            } : null
        };
    }

    toPublicJSON() {
        return {
            candidate_id: this.candidate_id,
            election_id: this.election_id,
            party_name: this.party_name,
            symbol: this.symbol,
            manifesto: this.manifesto,
            age: this.age,
            qualification: this.qualification,
            total_votes: this.total_votes,
            status: this.status,
            registered_at: this.registered_at,
            user: this.user ? {
                fullname: this.user.fullname,
                profile_photo: this.user.profile_photo
            } : null
        };
    }
}

module.exports = Candidate;
