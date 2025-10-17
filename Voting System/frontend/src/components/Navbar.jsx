import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Vote, LogOut, UserCog, FileCheck, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Navbar = ({ user, isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
              VoteSphere
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/verification">
                  <Button variant="ghost" className="gap-2">
                    <FileCheck className="h-4 w-4" />
                    Verification
                  </Button>
                </Link>
                
                <Link to="/candidates">
                  <Button variant="ghost" className="gap-2">
                    <Vote className="h-4 w-4" />
                    Candidates
                  </Button>
                </Link>
                
                <Link to="/vote-integrity">
                  <Button variant="ghost" className="gap-2">
                    <Hash className="h-4 w-4" />
                    Vote Integrity
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className="gap-2">
                      <UserCog className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


