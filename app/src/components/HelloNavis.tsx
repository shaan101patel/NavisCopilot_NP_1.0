import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * HelloNavis Component
 * A simple welcome component to verify the setup using our design system
 */
const HelloNavis: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
          Welcome to Navis MVP
        </h1>
        <p className="text-lg text-secondary mb-8">
          AI-powered customer service and sales platform
        </p>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-primary">Setup Complete! 🎉</CardTitle>
            <CardDescription>
              Your frontend is ready for development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-6">
              Built with React, TypeScript, Tailwind CSS, and Redux Toolkit using our modern design system.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="default">
                Get Started
              </Button>
              <Button variant="outline">
                View Docs
              </Button>
            </div>
          </CardContent>        </Card>
      </div>
    </div>
  );
};

export default HelloNavis;
