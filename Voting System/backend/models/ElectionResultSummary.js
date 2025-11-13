const CandidateResult = require('./CandidateResult');

class ElectionResultSummary {
    constructor({
        election_id,
        title,
        status,
        generated_at = new Date(),
        total_votes = 0,
        total_registered_voters = 0,
        voter_turnout_percentage = 0,
        candidates = [],
        winner = null,
        remarks = null,
        timeframe = {}
    }) {
        this.electionId = election_id;
        this.title = title;
        this.status = status;
        this.generatedAt = generated_at ? new Date(generated_at) : new Date();
        this.totalVotes = Number(total_votes) || 0;
        this.totalRegisteredVoters = Number(total_registered_voters) || 0;
        this.voterTurnoutPercentage = Number(voter_turnout_percentage) || 0;
        this.candidates = candidates.map(candidate =>
            candidate instanceof CandidateResult ? candidate : new CandidateResult(candidate)
        );
        this.winner = winner
            ? (winner instanceof CandidateResult ? winner : new CandidateResult(winner))
            : null;
        this.remarks = remarks;
        this.timeframe = timeframe;
        this.chart = this.#buildChartData();
    }

    #buildChartData() {
        const pieSlices = this.candidates.map(candidate => candidate.toPieSlice());
        const barSeries = this.candidates.map(candidate => candidate.toBarDatum());

        return {
            pie: {
                labels: pieSlices.map(slice => slice.label),
                series: pieSlices.map(slice => slice.value),
                meta: pieSlices
            },
            bar: {
                categories: barSeries.map(datum => datum.x),
                series: [
                    {
                        name: 'Votes',
                        data: barSeries.map(datum => ({
                            x: datum.x,
                            y: datum.y,
                            candidateId: datum.candidateId
                        }))
                    }
                ]
            },
            summary: {
                totalVotes: this.totalVotes,
                voterTurnoutPercentage: this.voterTurnoutPercentage
            }
        };
    }

    toJSON() {
        return {
            election_id: this.electionId,
            title: this.title,
            status: this.status,
            generated_at: this.generatedAt,
            total_votes: this.totalVotes,
            total_registered_voters: this.totalRegisteredVoters,
            voter_turnout_percentage: this.voterTurnoutPercentage,
            chart: this.chart,
            winner: this.winner ? this.winner.toJSON() : null,
            candidates: this.candidates.map(candidate => candidate.toJSON()),
            remarks: this.remarks,
            timeframe: this.timeframe
        };
    }
}

module.exports = ElectionResultSummary;

