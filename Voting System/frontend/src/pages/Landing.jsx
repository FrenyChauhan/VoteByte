import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Vote, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import heroImage from "@/assets/hero-voting.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Secure, Transparent{" "}
              <span className="bg-[var(--gradient-primary)] bg-clip-text ">
                Digital Voting
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience the future of democracy with our end-to-end encrypted voting platform. 
              Your vote, your voice, completely secure.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="text-lg px-8">
                  Start Voting
                </Button>
              </Link>
              <Link to="/candidates">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Candidates
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-20 blur-3xl rounded-full"></div>
            <img 
              src={heroImage} 
              alt="Secure Digital Voting" 
              className="relative rounded-2xl shadow-[var(--shadow-primary)] w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="bg-[var(--gradient-primary)] bg-clip-text">VoteSphere</span>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Shield,
              title: "Multi-Layer Security",
              description: "Advanced encryption and verification protocols protect every vote"
            },
            {
              icon: Lock,
              title: "End-to-End Encryption",
              description: "Your vote remains completely anonymous and secure"
            },
            {
              icon: Vote,
              title: "One Vote Policy",
              description: "Sophisticated fraud detection prevents duplicate voting"
            },
            {
              icon: CheckCircle,
              title: "Verified Authentication",
              description: "Multiple verification steps ensure voter authenticity"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 border border-border hover:border-primary/50 group"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-[var(--gradient-hero)] rounded-3xl p-12 text-center border border-primary/20">
          <h2 className="text-4xl font-bold mb-4">Ready to Make Your Voice Heard?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of voters who trust VoteSphere for safe, transparent elections
          </p>
          <Link to="/auth">
            <Button size="lg" variant="hero" className="text-lg px-12">
              Register to Vote
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 VoteSphere. Building trust in digital democracy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


