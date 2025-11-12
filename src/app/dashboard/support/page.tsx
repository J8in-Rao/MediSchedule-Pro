'use client';

import { PageHeader } from '@/components/shared/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const faqs = [
  {
    question: 'How do I reset my password?',
    answer:
      "To reset your password, log out of your account, then click the 'Forgot Password' link on the login page. You will receive an email with instructions on how to reset it.",
  },
  {
    question: 'How do I update my profile information?',
    answer:
      "You can update your profile information by navigating to the 'Settings' page from the user menu in the top-right corner. From there, you can edit your personal and professional details.",
  },
  {
    question: 'Who can see my patient data?',
    answer:
      'Patient data is confidential and is only accessible by authorized healthcare professionals, such as doctors and administrators, who are involved in your care. Your privacy is our top priority.',
  },
  {
    question: 'How do I cancel a scheduled surgery?',
    answer:
      'Doctors can cancel or reschedule a surgery directly from the "Schedule" page. If you are a patient, please contact your doctor’s office directly to make any changes to your appointment.',
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support"
        description="Find answers to common questions and get in touch with our team."
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Here are some of the most common questions we receive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                If you can&apos;t find an answer, please reach out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
