class CandidateResult {
    constructor({
        candidate_id,
        election_id,
        name,
        party_name,
        symbol,
        total_votes = 0,
        vote_percentage = 0,
        profile_photo = null
    }) {
        this.candidate_id = candidate_id;
        this.election_id = election_id;
        this.name = name || 'Unknown Candidate';
        this.party_name = party_name || 'Independent';
        this.symbol = symbol || null;
        this.total_votes = Number(total_votes) || 0;
        this.vote_percentage = Number(vote_percentage) || 0;
        this.profile_photo = profile_photo;
    }

    get label() {
        const base = this.party_name && this.party_name !== 'Independent'
            ? this.party_name
            : this.name;
        return `${base}`;
    }

    toPieSlice() {
        return {
            id: this.candidate_id,
            label: this.label,
            value: this.total_votes,
            percentage: this.vote_percentage
        };
    }

    toBarDatum() {
        return {
            x: this.label,
            y: this.total_votes,
            candidateId: this.candidate_id,
            percentage: this.vote_percentage
        };
    }

    toJSON() {
        return {
            candidate_id: this.candidate_id,
            election_id: this.election_id,
            name: this.name,
            party_name: this.party_name,
            symbol: this.symbol,
            total_votes: this.total_votes,
            vote_percentage: this.vote_percentage,
            profile_photo: this.profile_photo
        };
    }
}

module.exports = CandidateResult;

