import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="space-y-8 animate-slide-up max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      </div>

      <div className="glass-card p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Effective Date: February 21, 2026</p>

        <p>
          Welcome to Helix ("we", "our", "us").
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our application and related services (the "Service").
        </p>
        <p>By using Helix, you agree to the terms of this Privacy Policy.</p>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">1.1 Information You Provide</h3>
            <p>When you create an account or use the Service, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Account login credentials</li>
              <li>Tasks, verticals, blocks, and other content you create</li>
              <li>Any information you voluntarily submit through the platform</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">1.2 Automatically Collected Information</h3>
            <p>We may automatically collect limited technical data such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Usage logs</li>
              <li>Session information</li>
            </ul>
            <p>This information is used strictly for security, analytics, and improving the Service.</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and operate the Service</li>
            <li>Maintain account security</li>
            <li>Improve functionality and user experience</li>
            <li>Monitor system performance and prevent abuse</li>
            <li>Communicate important service updates</li>
          </ul>
          <p className="font-medium text-foreground">We do not sell your personal data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Data Storage and Security</h2>
          <p>We implement reasonable technical and organizational measures to protect your data.</p>
          <p>However, no system is 100% secure. By using the Service, you acknowledge that you provide information at your own risk.</p>
          <p>If the Service is hosted on third-party infrastructure (such as cloud providers), data may be stored on their servers under industry-standard security practices.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Data Ownership</h2>
          <p>You retain ownership of the content you create within Helix.</p>
          <p>We do not claim ownership over your tasks, notes, or personal data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Data Sharing</h2>
          <p>We do not share your personal data with third parties except:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>When required by law</li>
            <li>To comply with legal obligations</li>
            <li>To protect the security and integrity of the Service</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Account Deletion</h2>
          <p>You may request deletion of your account and associated data by contacting us.</p>
          <p>Upon request, we will delete your personal data within a reasonable timeframe, unless retention is required by law.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Cookies and Tracking</h2>
          <p>Helix may use cookies or similar technologies for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Authentication</li>
            <li>Session management</li>
            <li>Basic analytics</li>
          </ul>
          <p>You may disable cookies through your browser settings, though this may affect functionality.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Children's Privacy</h2>
          <p>Helix is not intended for individuals under the age of 13 (or applicable minimum age in your jurisdiction). We do not knowingly collect personal data from children.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Effective Date" above.</p>
          <p>Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">10. Contact Us</h2>
          <p>If you have questions regarding this Privacy Policy, please contact the Helix team at belmor95@gmail.com   </p>
        </section>
      </div>
    </div>);

}