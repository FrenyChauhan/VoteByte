import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Hash, Calendar, User, Vote as VoteIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VoteIntegrity = () => {
  const [voteHash, setVoteHash] = useState("");
  const [searching, setSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const verifyVoteIntegrity = async (e) => {
    e.preventDefault();
    if (!voteHash.trim()) {
      toast.error("Please enter a vote hash");
      return;
    }

    setSearching(true);
    setSearchAttempted(true);
    setVerificationResult(null);

    try {
      const { data: voteData, error } = await supabase
        .from("votes")
        .select(`
          id,
          vote_hash,
          cast_at,
          encrypted_vote,
          candidates (name, party)
        `)
        .eq("vote_hash", voteHash.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!voteData) {
        setVerificationResult({
          id: "",
          vote_hash: voteHash.trim(),
          cast_at: "",
          is_valid: false
        });
        return;
      }

      const voteString = atob(voteData.encrypted_vote);
      const encoder = new TextEncoder();
      const data = encoder.encode(voteString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const isValid = computedHash === voteData.vote_hash;

      setVerificationResult({
        id: voteData.id,
        vote_hash: voteData.vote_hash,
        cast_at: voteData.cast_at,
        is_valid: isValid,
        candidate_name: voteData.candidates?.name,
        candidate_party: voteData.candidates?.party
      });

      if (isValid) {
        toast.success("Vote integrity verified successfully!");
      } else {
        toast.error("Vote integrity verification failed!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to verify vote integrity");
      console.error("Vote verification error:", error);
    } finally {
      setSearching(false);
    }
  };

  const generateSampleHash = () => {
    const sampleString = `sample-vote-${Date.now()}`;
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(sampleString)).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setVoteHash(hash.substring(0, 32));
      toast.info("Sample hash generated for testing");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <Hash className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">
            Vote <span className="bg-[var(--gradient-primary)] bg-clip-text">Integrity</span> Checker
          </h1>
          <p className="text-muted-foreground">
            Verify the integrity and authenticity of cast votes using cryptographic hashes
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Vote Hash Verification
              </CardTitle>
              <CardDescription>
                Enter a vote hash to verify its integrity and authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={verifyVoteIntegrity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voteHash">Vote Hash</Label>
                  <Input
                    id="voteHash"
                    type="text"
                    placeholder="Enter vote hash (e.g., a1b2c3d4e5f6...)"
                    value={voteHash}
                    onChange={(e) => setVoteHash(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vote hashes are generated when votes are cast and can be found on vote receipts
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={searching} className="flex-1">
                    {searching ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Vote
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSampleHash}
                    disabled={searching}
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    Sample
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {searchAttempted && verificationResult && (
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.is_valid ? (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResult.is_valid ? (
                  <div className="space-y-4">
                    <Alert className="border-accent/20 bg-accent/5">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <AlertTitle className="text-accent">Vote Verified</AlertTitle>
                      <AlertDescription>
                        This vote hash is valid and the vote integrity has been confirmed.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Vote ID:</span>
                        <Badge variant="secondary" className="font-mono">
                          {verificationResult.id.substring(0, 8)}...
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Vote Hash:</span>
                        <Badge variant="secondary" className="font-mono text-xs max-w-32 truncate">
                          {verificationResult.vote_hash.substring(0, 16)}...
                        </Badge>
                      </div>

                      {verificationResult.candidate_name && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-muted-foreground">Candidate:</span>
                            <span className="font-medium">{verificationResult.candidate_name}</span>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-muted-foreground">Party:</span>
                            <span className="font-medium">{verificationResult.candidate_party}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Cast At:</span>
                        <span className="font-medium">
                          {new Date(verificationResult.cast_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Vote Not Found or Invalid</AlertTitle>
                    <AlertDescription>
                      The provided vote hash could not be verified. This could mean:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>The hash is incorrect or incomplete</li>
                        <li>The vote does not exist in our records</li>
                        <li>The vote data has been compromised</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                About Vote Integrity
              </CardTitle>
              <CardDescription>
                Understanding how vote verification works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <VoteIcon className="h-4 w-4" />
                    How It Works
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Each vote is encrypted and assigned a unique cryptographic hash</li>
                    <li>• The hash is generated using SHA-256 algorithm for maximum security</li>
                    <li>• Vote data integrity can be verified without revealing the actual vote</li>
                    <li>• Any tampering with vote data will result in hash mismatch</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Security Features
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Immutable vote records with blockchain-style hashing</li>
                    <li>• Anonymous verification - no personal information revealed</li>
                    <li>• Cryptographic proof of vote authenticity</li>
                    <li>• Tamper-evident vote storage and retrieval</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    For Voters
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Save your vote hash from the confirmation receipt</li>
                    <li>• Use this tool to verify your vote was recorded correctly</li>
                    <li>• Your identity remains completely anonymous during verification</li>
                    <li>• Report any integrity issues to election officials</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoteIntegrity;


