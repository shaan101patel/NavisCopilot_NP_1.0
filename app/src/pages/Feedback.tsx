import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

// IMPLEMENT LATER: Expected feedback data structure for backend integration
// interface FeedbackData {
//   message: string;
//   name?: string;
//   email?: string;
//   category?: string;
//   submittedAt: Date;
// }

const feedbackCategories = [
  { value: 'general', label: 'General Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'ui', label: 'UI/UX Improvement' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'other', label: 'Other' },
];

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.message.trim()) {
      alert('Please provide your feedback message.');
      return;
    }

    setIsSubmitting(true);

    try {
      // IMPLEMENT LATER: Send feedback data to backend API
      // const feedbackPayload: FeedbackData = {
      //   message: formData.message.trim(),
      //   name: formData.name.trim() || undefined,
      //   email: formData.email.trim() || undefined,
      //   category: formData.category,
      //   submittedAt: new Date(),
      // };
      
      // Example API call:
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(feedbackPayload),
      // });

      // Simulate API delay for UX demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        category: 'general',
        message: '',
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      // IMPLEMENT LATER: Proper error handling with toast notifications
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.message.trim().length > 0;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Share Your Feedback</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          We value your input! Help us improve Navis by sharing your thoughts, suggestions, or reporting any issues you've encountered.
        </p>
      </div>

      {isSubmitted && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Thank you for your feedback!</p>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Your message has been received and will be reviewed by our team.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>
            All fields except the message are optional, but providing contact information helps us follow up if needed.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Name Field (Optional) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Feedback Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {feedbackCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Field (Required) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Your Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please share your thoughts, suggestions, or describe any issues you've encountered..."
                disabled={isSubmitting}
                required
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 1 character required
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your feedback will be reviewed by our product team</li>
          <li>• Bug reports will be prioritized for investigation</li>
          <li>• Feature requests will be considered for future releases</li>
          <li>• If you provided contact information, we may reach out for clarification</li>
        </ul>
      </div>
    </div>
  );
}