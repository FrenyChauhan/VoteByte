import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Loader2, Plus, UserCog, BarChart3, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteStats, setVoteStats] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    biography: "",
    manifesto: "",
  });

  useEffect(() => {
    const checkAdmin = async () => {
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
      
      if (!roles?.some(r => r.role === "admin")) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      await fetchData();
    };

    checkAdmin();
    
    const votesSubscription = supabase
      .channel('votes-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      votesSubscription.unsubscribe();
    };
  }, [navigate]);

  const fetchData = async () => {
    const { data: candidatesData } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (candidatesData) {
      setCandidates(candidatesData);
    }

    const { data: votesData } = await supabase
      .from("votes")
      .select(`
        candidate_id,
        candidates (name, party)
      `);
    
    if (votesData) {
      const stats = votesData.reduce((acc, vote) => {
        const candidateId = vote.candidate_id;
        if (!acc[candidateId]) {
          acc[candidateId] = {
            name: vote.candidates?.name || "Unknown",
            party: vote.candidates?.party || "Unknown",
            count: 0,
          };
        }
        acc[candidateId].count++;
        return acc;
      }, {});
      
      const statsArray = Object.values(stats);
      setVoteStats(statsArray);
      setTotalVotes(votesData.length);
    }

    setLoading(false);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase.from("candidates").insert({
      name: newCandidate.name,
      party: newCandidate.party,
      biography: newCandidate.biography,
      manifesto: newCandidate.manifesto,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to add candidate");
    } else {
      toast.success("Candidate added successfully");
      setNewCandidate({ name: "", party: "", biography: "", manifesto: "" });
      await fetchData();
    }
  };

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success("Vote statistics refreshed");
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
      <Navbar user={user} isAdmin={true} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <UserCog className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">
            Admin <span className="bg-[var(--gradient-primary)] bg-clip-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage candidates and view election statistics</p>
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
            <TabsTrigger value="stats">Vote Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Candidate
                </CardTitle>
                <CardDescription>
                  Add a new candidate to the election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Candidate Name *</Label>
                      <Input
                        id="name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="party">Party *</Label>
                      <Input
                        id="party"
                        value={newCandidate.party}
                        onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biography">Biography</Label>
                    <Textarea
                      id="biography"
                      value={newCandidate.biography}
                      onChange={(e) => setNewCandidate({ ...newCandidate, biography: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manifesto">Manifesto</Label>
                    <Textarea
                      id="manifesto"
                      value={newCandidate.manifesto}
                      onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="hero">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Current Candidates</CardTitle>
                <CardDescription>
                  {candidates.length} candidate(s) in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No candidates added yet</p>
                ) : (
                  <div className="space-y-4">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.party}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            candidate.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                          }`}>
                            {candidate.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Vote Statistics
                    </CardTitle>
                    <CardDescription>
                      Real-time voting statistics (encrypted data)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      Total: {totalVotes}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshStats}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {voteStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No votes cast yet</p>
                ) : (
                  <div className="space-y-4">
                    {voteStats.map((stat, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{stat.name}</h4>
                            <p className="text-sm text-muted-foreground">{stat.party}</p>
                          </div>
                          <div className="text-2xl font-bold text-primary">{stat.count}</div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(stat.count / Math.max(...voteStats.map((s) => s.count))) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;


