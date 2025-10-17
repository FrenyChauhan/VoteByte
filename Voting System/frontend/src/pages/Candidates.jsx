import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Vote, Loader2 } from "lucide-react";

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      if (roles?.some(r => r.role === "admin")) {
        setIsAdmin(true);
      }

      const { data: voteData } = await supabase
        .from("votes")
        .select("id")
        .eq("voter_id", session.user.id)
        .maybeSingle();
      
      if (voteData) {
        setHasVoted(true);
      }
    };

    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        toast.error("Failed to load candidates");
      } else {
        setCandidates(data || []);
      }
      setLoading(false);
    };

    checkAuth();
    fetchCandidates();

    const channel = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
        },
        () => {
          fetchCandidates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar user={user} isAdmin={isAdmin} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mb-4">
            <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
              Mother Teresa Bhavan, SVNIT
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Meet the <span className="bg-[var(--gradient-primary)] bg-clip-text">Candidates</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about each candidate's vision and manifesto before casting your vote
          </p>
        </div>

        {hasVoted && (
          <div className="mb-8 p-4 bg-accent/10 border border-accent rounded-lg text-center">
            <p className="text-accent font-semibold">You have already cast your vote. Thank you for participating!</p>
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No candidates available at this time.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-[var(--shadow-card)] transition-all duration-300 border-border hover:border-primary/50">
                <CardHeader>
                  {candidate.symbol_url && (
                    <div className="w-20 h-20 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <img src={candidate.symbol_url} alt={`${candidate.name} symbol`} className="w-16 h-16 object-contain" />
                    </div>
                  )}
                  <CardTitle className="text-center text-2xl">{candidate.name}</CardTitle>
                  <CardDescription className="text-center">
                    <Badge variant="secondary" className="mt-2">{candidate.party}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.biography && (
                    <div>
                      <h4 className="font-semibold mb-2">Biography</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">{candidate.biography}</p>
                    </div>
                  )}
                  {candidate.manifesto && (
                    <div>
                      <h4 className="font-semibold mb-2">Manifesto</h4>
                      <p className="text-sm text-muted-foreground line-clamp-4">{candidate.manifesto}</p>
                    </div>
                  )}
                  {candidate.campaign_video_url && (
                    <div>
                      <a href={candidate.campaign_video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Watch Campaign Video
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasVoted && candidates.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="hero" 
              onClick={() => navigate("/vote")}
              className="text-lg px-12"
            >
              <Vote className="mr-2 h-5 w-5" />
              Proceed to Vote
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;


