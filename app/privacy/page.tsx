'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-300 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
            <div className="text-gray-300 space-y-6 leading-relaxed">
              <p className="text-sm text-gray-400">Last Updated: August 19, 2025</p>
              
              <p>
                Thank you for visiting TranscribeAI ("we," "us," or "our"). This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
              </p>
              
              <p>
                By accessing or using our Website and services, you agree to the terms of this Privacy Policy. If you disagree with any terms, please do not use our services.
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">1.1 Personal Data</h3>
                <p>We collect the following personal information:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li><strong>Name</strong>: Collected through Google OAuth to personalize your experience and communicate effectively.</li>
                  <li><strong>Email</strong>: Used for account management, token purchase confirmations, and essential communication.</li>
                  <li><strong>Google Profile Image</strong>: Used to display your avatar in the application interface.</li>
                  <li><strong>Payment Information</strong>: Collected for processing token purchases. Payments are securely processed by Stripe, our third-party payment processor.</li>
                </ul>

                <h3 className="text-xl font-medium text-white mb-3 mt-6">1.2 Content Data</h3>
                <p>When you use our services, we temporarily process:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li><strong>Audio/Video Files</strong>: Uploaded files are processed for transcription and then automatically deleted.</li>
                  <li><strong>URLs</strong>: YouTube and other platform URLs for content extraction and transcription.</li>
                  <li><strong>Transcriptions</strong>: Generated text content which is stored in your account for access and management.</li>
                  <li><strong>AI-Generated Content</strong>: Notes, summaries, and documents generated from your transcriptions.</li>
                </ul>

                <h3 className="text-xl font-medium text-white mb-3 mt-6">1.3 Usage Data</h3>
                <p>We collect non-personal information such as:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>IP address and browser information</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Token consumption and spending history</li>
                  <li>Performance and error logs for service improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p>We use your information for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Providing transcription and AI content generation services</li>
                  <li>Managing your account and token balance</li>
                  <li>Processing payments and maintaining purchase history</li>
                  <li>Improving our services and user experience</li>
                  <li>Communicating important updates and support responses</li>
                  <li>Ensuring security and preventing abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
                <p>
                  Your account data and transcriptions are stored securely in our MongoDB database. We implement industry-standard security measures to protect your information. Audio and video files are processed temporarily and automatically deleted after transcription completion.
                </p>
                <p className="mt-3">
                  Payment processing is handled entirely by Stripe, and we do not store your payment card information on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Third Parties</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We only share data with:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Google</strong>: For authentication services (OAuth)</li>
                  <li><strong>Stripe</strong>: For secure payment processing</li>
                  <li><strong>OpenAI</strong>: For transcription and AI content generation (content only, no personal data)</li>
                  <li><strong>MongoDB Atlas</strong>: For secure data storage</li>
                </ul>
                <p className="mt-3">
                  These service providers are bound by their own privacy policies and security standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Anonymous Usage</h2>
                <p>
                  TranscribeAI offers limited anonymous usage without account creation. Anonymous users can access basic transcription features, but content is not saved permanently and no personal data is collected beyond basic usage analytics.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access and download your transcription data</li>
                  <li>Delete your account and associated data</li>
                  <li>Request corrections to your personal information</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request a copy of your data</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at the email address below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Children's Privacy</h2>
                <p>
                  TranscribeAI is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe your child has provided personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. International Users</h2>
                <p>
                  Our services are operated from Germany. By using our services, you consent to the transfer and processing of your information in Germany, which may have different privacy laws than your country of residence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements. We will notify users of significant changes via email or prominent notice on our website. Your continued use of our services after such modifications constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
                <p>For questions or concerns about this Privacy Policy, please contact us at:</p>
                <p className="ml-4 mt-2">Email: transcribe@snapcoder.io</p>
              </section>

              <p className="text-center text-gray-400 mt-12">Thank you for trusting TranscribeAI with your data!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
