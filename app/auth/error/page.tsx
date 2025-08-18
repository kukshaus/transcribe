'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.'
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.'
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.'
      case 'Callback':
        return 'Error in the OAuth callback handler route.'
      case 'OAuthAccountNotLinked':
        return 'The email on the account is already linked, but not with this OAuth account.'
      case 'EmailSignin':
        return 'Sending the e-mail with the verification token failed.'
      case 'CredentialsSignin':
        return 'The credentials you provided are incorrect.'
      case 'SessionRequired':
        return 'You must be signed in to view this page.'
      default:
        return 'An unknown error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" variant="light" showText={true} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-md py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-white/20">
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">
                  {getErrorMessage(error)}
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Try signing in again
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
