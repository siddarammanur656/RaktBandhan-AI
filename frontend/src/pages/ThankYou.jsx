import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Try to close the window (works if opened via email link usually)
          window.close();
          // Fallback to home/dashboard
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  let icon = <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />;
  let title = "Thank You!";
  let message = "Your response has been recorded.";

  if (status === 'success') {
    title = "Request Accepted!";
    message = "Thank you for stepping up to save a life. The patient's team will contact you shortly.";
  } else if (status === 'declined') {
    icon = <Clock className="w-16 h-16 text-amber-500 mb-4" />;
    title = "Response Recorded";
    message = "Thank you for letting us know. We will match another donor.";
  } else if (status === 'already_filled') {
    icon = <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />;
    title = "Request Already Fulfilled";
    message = "Another donor has already accepted this request. Thank you for your willingness to help!";
  } else if (error === 'notfound') {
    icon = <XCircle className="w-16 h-16 text-red-500 mb-4" />;
    title = "Invalid Request";
    message = "We couldn't find this request. It may have expired or been deleted.";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card/80 backdrop-blur-md border border-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        
        <div className="text-sm text-muted-foreground/70 flex flex-col items-center gap-2">
          <p>You can close this window now.</p>
          <p>Auto-closing in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
}
