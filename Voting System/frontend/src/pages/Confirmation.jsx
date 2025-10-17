import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Download, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [voteDetails, setVoteDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoteDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: voteData } = await supabase
        .from("votes")
        .select(`
          id,
          vote_hash,
          cast_at,
          candidates (name, party)
        `)
        .eq("voter_id", session.user.id)
        .single();

      if (voteData) {
        setVoteDetails(voteData);
      }
      setLoading(false);
    };

    fetchVoteDetails();
  }, [navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadReceipt = () => {
    if (!voteDetails) return;
    
    const receipt = `
VOTE RECEIPT
============
Election: General Election 2024
Vote ID: ${voteDetails.id}
Vote Hash: ${voteDetails.vote_hash}
Candidate: ${voteDetails.candidates?.name}
Party: ${voteDetails.candidates?.party}
Cast At: ${new Date(voteDetails.cast_at).toLocaleString()}

This is your digital receipt. Keep it safe for your records.
Your vote is encrypted and anonymous.
`;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${voteDetails.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Receipt downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your vote confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-2xl w-full shadow-[var(--shadow-card)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-accent/10 p-4">
                <CheckCircle className="h-16 w-16 text-accent" />
              </div>
            </div>
            <CardTitle className="text-3xl">Vote Confirmed!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your vote has been securely recorded and encrypted
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {voteDetails && (
              <div className="p-6 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Digital Receipt</h4>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vote ID:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {voteDetails.id.substring(0, 8)}...
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(voteDetails.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vote Hash:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {voteDetails.vote_hash.substring(0, 12)}...
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(voteDetails.vote_hash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidate:</span>
                    <span className="font-medium">{voteDetails.candidates?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Party:</span>
                    <span className="font-medium">{voteDetails.candidates?.party}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cast At:</span>
                    <span className="font-medium">
                      {new Date(voteDetails.cast_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadReceipt}
                  className="w-full mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
            )}
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Your vote is encrypted and stored securely</li>
                <li>✓ Your identity remains completely anonymous</li>
                <li>✓ The vote cannot be altered or deleted</li>
                <li>✓ Results will be announced after voting closes</li>
                <li>✓ Keep your vote hash for verification purposes</li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Thank you for participating in this democratic process. Your voice matters!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => navigate("/candidates")} 
                variant="default"
              >
                View Candidates
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;


