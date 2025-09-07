import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Briefcase } from 'lucide-react';

interface CountdownProps {
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const UnemploymentCountdown: React.FC<CountdownProps> = ({ className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  // Target date: June 1st, 2026 at midnight
  const targetDate = new Date('2026-06-01T00:00:00').getTime();

  useEffect(() => {
    setIsClient(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const getMotivationalMessage = () => {
    const messages = [
      "Time to find that perfect job! 💼",
      "The countdown to freedom begins! 🚀", 
      "Every day is one step closer to your dream role! ✨",
      "The job hunt adventure continues! 🎯",
      "Future success is loading... ⏳",
      "Your next opportunity is out there! 🌟"
    ];
    
    const index = Math.floor(timeLeft.days / 30) % messages.length;
    return messages[index];
  };

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Official Unemployment Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-2xl font-mono text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          Official Unemployment Countdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isExpired ? 
            "🎉 The day has arrived!" : 
            "Time until the job search gets... interesting 😅"
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {isExpired ? (
            <>
              <div className="text-4xl font-bold text-primary">
                🎉 IT'S TIME! 🎉
              </div>
              <p className="text-lg text-muted-foreground">
                June 1st, 2026 has arrived! Time to put this dashboard to good use! 🚀
              </p>
            </>
          ) : (
            <>
              {/* Countdown Display */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">Days</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Target Date: June 1st, 2026
                </div>
                <p className="text-sm font-medium text-primary">
                  {getMotivationalMessage()}
                </p>
              </div>

              {/* Fun Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Job Hunt Prep Time</span>
                  <span>{Math.max(0, Math.round((1 - (timeLeft.days / 365)) * 100))}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(5, Math.min(95, (1 - (timeLeft.days / 365)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnemploymentCountdown;