import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Vote as VoteIcon, Loader2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Vote = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthAndVoteStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: voteData } = await supabase
        .from("votes")
        .select("id")
        .eq("voter_id", session.user.id)
        .maybeSingle();
      
      if (voteData) {
        toast.error("You have already voted");
        navigate("/candidates");
        return;
      }

      const { data, error } = await supabase
        .from("candidates")
        .select("id, name, party, symbol_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        toast.error("Failed to load candidates");
        navigate("/candidates");
      } else {
        setCandidates(data || []);
      }
      setLoading(false);
    };

    checkAuthAndVoteStatus();
  }, [navigate]);

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setSubmitting(true);

    try {
      const voteString = `${user.id}-${selectedCandidate}-${Date.now()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(voteString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const voteHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const { error } = await supabase.from("votes").insert({
        voter_id: user.id,
        candidate_id: selectedCandidate,
        encrypted_vote: btoa(voteString),
        vote_hash: voteHash,
      });

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "VOTE_CAST",
        resource_type: "vote",
        resource_id: selectedCandidate,
        metadata: { vote_hash: voteHash },
      });

      toast.success("Your vote has been cast successfully!", {
        description: "Thank you for participating in this election.",
      });

      navigate("/confirmation");
    } catch (error) {
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <VoteIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">
            Cast Your <span className="bg-[var(--gradient-primary)] bg-clip-text">Vote</span>
          </h1>
          <p className="text-muted-foreground">
            Select your preferred candidate and confirm your choice
          </p>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Select a Candidate</CardTitle>
            <CardDescription>
              Your vote is encrypted and completely anonymous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedCandidate === candidate.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <RadioGroupItem value={candidate.id} id={candidate.id} />
                    <div className="flex items-center gap-4 flex-1">
                      {candidate.symbol_url && (
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <img src={candidate.symbol_url} alt={`${candidate.name} symbol`} className="w-10 h-10 object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Label htmlFor={candidate.id} className="text-lg font-semibold cursor-pointer">
                          {candidate.name}
                        </Label>
                        <Badge variant="secondary" className="mt-1">{candidate.party}</Badge>
                      </div>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="mt-8 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Security Notice</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your vote is encrypted and anonymous</li>
                  <li>• You can only vote once</li>
                  <li>• Your vote cannot be changed after submission</li>
                  <li>• All votes are audited for security</li>
                </ul>
              </div>

              <Button
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || submitting}
                className="w-full"
                variant="success"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Vote...
                  </>
                ) : (
                  <>
                    <VoteIcon className="mr-2 h-5 w-5" />
                    Confirm and Cast Vote
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vote;


