'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
            <div className="text-gray-300 space-y-6 leading-relaxed">
              <p className="text-sm text-gray-400">Last Updated: August 19, 2025</p>
              
              <p>Welcome to TranscribeAI!</p>
              
              <p>These Terms of Service ("Terms") govern your use of the TranscribeAI website and the services provided by TranscribeAI. By using our Website and services, you agree to these Terms.</p>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Description of TranscribeAI</h2>
                <p>TranscribeAI provides users with audio and video transcription services, AI-generated notes, and document generation features. We offer both free anonymous usage and paid authenticated accounts with token-based pricing.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Service Access and Usage</h2>
                <p>Anonymous users can access limited free transcription services. Authenticated users can purchase tokens to access additional features including:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Audio and video transcription</li>
                  <li>AI-generated notes and summaries</li>
                  <li>Product Requirements Document (PRD) generation</li>
                  <li>Audio file downloads</li>
                  <li>Export capabilities (text, markdown, Notion format)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Token System and Payments</h2>
                <p>Our paid services operate on a token-based system where:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>1 token = 1 transcription</li>
                  <li>1 token = 1 AI notes generation</li>
                  <li>2 tokens = 1 PRD generation</li>
                </ul>
                <p>Tokens are consumed only after successful completion of the requested service. All token purchases are final and non-refundable.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Refund Policy</h2>
                <p>All purchases are final. TranscribeAI does not offer refunds for token purchases under any circumstances, except where required by applicable law.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. User Content and Data</h2>
                <p>You retain ownership of any audio, video, or other content you upload to our service. By using our service, you grant us a limited license to process your content for the purpose of providing transcription and related services. We do not store uploaded media files permanently and delete them after processing.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Privacy and Data Protection</h2>
                <p>We collect and store user data necessary to provide our services, including name, email, and payment information for authenticated users. For details on data handling, please refer to our Privacy Policy.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Prohibited Uses</h2>
                <p>You agree not to use our service for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Illegal, harmful, or abusive content</li>
                  <li>Content that violates intellectual property rights</li>
                  <li>Automated or bulk processing that could overwhelm our systems</li>
                  <li>Any purpose that violates applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
                <p>We strive to maintain high service availability but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue services with reasonable notice.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Intellectual Property</h2>
                <p>The TranscribeAI platform, including its design, functionality, and underlying technology, is protected by intellectual property laws. Users are granted a limited license to use the service for its intended purpose.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, TranscribeAI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
                <p>These Terms are governed by the laws of Germany, without regard to conflict of law principles.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Updates to Terms</h2>
                <p>TranscribeAI may update these Terms periodically. Users will be notified of significant changes via email or website notification. Continued use of the service constitutes acceptance of updated Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
                <p>For any questions or concerns regarding these Terms of Service, please contact us at:</p>
                <p className="ml-4">Email: support@transcribeai.com</p>
              </section>

              <p className="text-center text-gray-400 mt-12">Thank you for using TranscribeAI!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
