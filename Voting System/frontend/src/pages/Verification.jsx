import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, Phone, Shield, FileCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Verification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: verificationData } = await supabase
        .from("voter_verification")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (verificationData) {
        setVerificationStatus(verificationData);
        setAadhaarNumber(verificationData.aadhaar_number || "");
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setPhoneNumber(profileData.phone_number || "");
      }

      setLoading(false);
    };

    fetchVerificationStatus();
  }, [navigate]);

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("voter_verification")
        .update({
          aadhaar_number: aadhaarNumber,
          verification_attempts: (verificationStatus?.verification_attempts || 0) + 1,
          last_verification_attempt: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Aadhaar number submitted for verification");
      
      const { data: updatedData } = await supabase
        .from("voter_verification")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (updatedData) {
        setVerificationStatus(updatedData);
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit Aadhaar number");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSubmitting(true);
    try {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp_${user.id}`, mockOtp);
      localStorage.setItem(`otp_timestamp_${user.id}`, Date.now().toString());
      
      setOtpSent(true);
      toast.success(`OTP sent to ${phoneNumber}. Demo OTP: ${mockOtp}`);
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setSubmitting(true);
    try {
      const storedOtp = localStorage.getItem(`otp_${user.id}`);
      const otpTimestamp = localStorage.getItem(`otp_timestamp_${user.id}`);
      
      if (!storedOtp || !otpTimestamp || Date.now() - parseInt(otpTimestamp) > 300000) {
        toast.error("OTP expired. Please request a new one.");
        setOtpSent(false);
        setSubmitting(false);
        return;
      }

      if (otp !== storedOtp) {
        toast.error("Invalid OTP");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("voter_verification")
        .update({
          phone_verified: true,
          otp_verified: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      localStorage.removeItem(`otp_${user.id}`);
      localStorage.removeItem(`otp_timestamp_${user.id}`);

      toast.success("Phone number verified successfully!");
      
      const { data: updatedData } = await supabase
        .from("voter_verification")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (updatedData) {
        setVerificationStatus(updatedData);
      }
      
      setOtpSent(false);
      setOtp("");
    } catch (error) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (verified, pending) => {
    if (verified) return <CheckCircle className="h-5 w-5 text-accent" />;
    if (pending) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-accent/10 text-accent">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
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
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">
            Voter <span className="bg-[var(--gradient-primary)] bg-clip-text">Verification</span>
          </h1>
          <p className="text-muted-foreground">
            Complete your verification to become eligible to vote
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Your current verification progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium">Overall Status:</span>
                {verificationStatus && getStatusBadge(verificationStatus.verification_status)}
              </div>

              {verificationStatus?.verification_status === 'rejected' && (
                <Alert className="mb-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Verification Rejected</AlertTitle>
                  <AlertDescription>
                    Your verification was rejected. Please review your documents and try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(!!verificationStatus?.aadhaar_number, !verificationStatus?.aadhaar_number)}
                    <span className="font-medium">Aadhaar Verification</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {verificationStatus?.aadhaar_number ? "Submitted" : "Required"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(verificationStatus?.phone_verified || false)}
                    <span className="font-medium">Phone Verification</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {verificationStatus?.phone_verified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(verificationStatus?.otp_verified || false)}
                    <span className="font-medium">OTP Verification</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {verificationStatus?.otp_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="aadhaar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="aadhaar">Aadhaar Verification</TabsTrigger>
              <TabsTrigger value="phone">Phone Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="aadhaar">
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle>Aadhaar Verification</CardTitle>
                  <CardDescription>
                    Enter your Aadhaar number for identity verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAadhaarSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Number</Label>
                      <Input
                        id="aadhaar"
                        type="text"
                        placeholder="1234 5678 9012"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        maxLength={12}
                        disabled={!!verificationStatus?.aadhaar_number}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your 12-digit Aadhaar number without spaces
                      </p>
                    </div>
                    
                    {!verificationStatus?.aadhaar_number && (
                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Aadhaar"
                        )}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="phone">
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle>Phone Verification</CardTitle>
                  <CardDescription>
                    Verify your phone number with OTP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={verificationStatus?.phone_verified}
                    />
                  </div>

                  {!verificationStatus?.phone_verified && !otpSent && (
                    <Button 
                      onClick={handlePhoneVerification} 
                      disabled={submitting}
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  )}

                  {otpSent && !verificationStatus?.otp_verified && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit OTP sent to your phone
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleOtpVerification} 
                          disabled={submitting}
                          className="flex-1"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setOtpSent(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {verificationStatus?.phone_verified && (
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="font-medium text-accent">Phone Verified</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Voting Eligibility</CardTitle>
              <CardDescription>
                Check your eligibility to participate in elections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationStatus?.verification_status === 'verified' ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-semibold mb-2">You're Eligible to Vote!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your verification is complete. You can now participate in elections.
                  </p>
                  <Button onClick={() => navigate("/candidates")} className="w-full max-w-sm">
                    View Elections
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-semibold mb-2">Verification Required</h3>
                  <p className="text-muted-foreground">
                    Complete all verification steps to become eligible to vote.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verification;


