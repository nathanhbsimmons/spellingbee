import { useState, useEffect } from 'react'
import { createFamily, joinFamily, getFamily } from '../db'
import { useFamily } from '../contexts/FamilyContext'
import { hasLocalStorageData, hasMigrated, migrateLocalStorageToFirestore } from '../migrate'
import { getFunctions, httpsCallable } from 'firebase/functions'

export default function FamilySetup() {
  const { familyId: existingFamilyId, setFamilyId } = useFamily()
  const [mode, setMode] = useState(null) // null | 'create' | 'join' | 'migrate' | 'view-code'
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [createdFamilyId, setCreatedFamilyId] = useState('')
  const [retrievedCode, setRetrievedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState(null) // null | 'pending' | 'success' | 'error'
  const [joinEmail, setJoinEmail] = useState('')
  const [joinEmailStatus, setJoinEmailStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  useEffect(() => {
    // Check if we should show migration prompt
    if (hasLocalStorageData() && !hasMigrated()) {
      setShowMigrationPrompt(true)
    }
  }, [])

  // Load existing family's join code if they already have a familyId
  useEffect(() => {
    const loadExistingFamilyCode = async () => {
      if (existingFamilyId && !createdCode) {
        try {
          const family = await getFamily(existingFamilyId)
          if (family && family.joinCode) {
            setRetrievedCode(family.joinCode)
            setMode('view-code')
          }
        } catch (err) {
          console.error('Failed to load family join code:', err)
        }
      }
    }

    loadExistingFamilyCode()
  }, [existingFamilyId, createdCode])

  const handleCreate = async (email = null) => {
    setLoading(true)
    setError('')
    setEmailDeliveryStatus(null)
    try {
      const { familyId, joinCode } = await createFamily(email)
      setCreatedCode(joinCode)
      setCreatedFamilyId(familyId)
      setParentEmail(email || '')

      // If there's data to migrate and user hasn't migrated yet, show migration prompt
      if (showMigrationPrompt && hasLocalStorageData() && !hasMigrated()) {
        setMode('migrate')
      } else {
        setFamilyId(familyId)
      }
    } catch (err) {
      setError('Failed to create family. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMigrate = async () => {
    setLoading(true)
    setError('')
    try {
      const success = await migrateLocalStorageToFirestore(createdFamilyId)
      if (success) {
        setFamilyId(createdFamilyId)
      } else {
        setError('Migration failed. Your new family was created, but data could not be imported.')
      }
    } catch (err) {
      setError('Migration failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipMigration = () => {
    setFamilyId(createdFamilyId)
  }

  const handleRequestJoinCode = async () => {
    if (!joinEmail.includes('@')) return
    setJoinEmailStatus('sending')
    try {
      const functions = getFunctions(undefined, 'us-central1')
      const requestJoinCode = httpsCallable(functions, 'requestJoinCode')
      await requestJoinCode({ email: joinEmail })
      setJoinEmailStatus('sent')
    } catch (err) {
      console.error('Failed to request join code:', err)
      setJoinEmailStatus('error')
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a join code')
      return
    }

    setLoading(true)
    setError('')
    try {
      const familyId = await joinFamily(joinCode.trim())
      if (!familyId) {
        setError('Invalid join code. Please check and try again.')
      } else {
        setFamilyId(familyId)
      }
    } catch (err) {
      setError('Failed to join family. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'view-code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-purple-900">
            Family Join Code 🔗
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Share this code with other devices to sync your spelling practice:
          </p>

          <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
            <p className="text-center text-4xl font-bold text-purple-900 tracking-widest">
              {retrievedCode}
            </p>
          </div>

          <p className="text-sm text-gray-500 text-center mb-6">
            Give this code to anyone who wants to join your family.
          </p>

          <button
            onClick={() => setMode(null)}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Continue to App
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'migrate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-purple-900">
            Import Existing Data? 📦
          </h1>
          <p className="text-center text-gray-600 mb-6">
            We found existing word lists and practice history on this device. Would you like to import them to your new family?
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>

            <button
              onClick={handleSkipMigration}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Skip (Start Fresh)
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            Don't worry, your local data will remain on this device even if you skip.
          </p>
        </div>
      </div>
    )
  }

  if (mode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-purple-900">
            Welcome! 🌟
          </h1>
          <p className="text-center text-gray-600 mb-8">
            To sync your spelling practice across devices, you'll need to create or join a family.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Create New Family
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Join Existing Family
            </button>

            {retrievedCode && (
              <button
                onClick={() => setMode('view-code')}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View Family Join Code
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    if (createdCode) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center mb-4 text-purple-900">
              Family Created! 🎉
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Share this code with other devices to sync your data:
            </p>

            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
              <p className="text-center text-4xl font-bold text-purple-900 tracking-widest">
                {createdCode}
              </p>
            </div>

            {parentEmail && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Email:</strong> {parentEmail}
                </p>
                {emailDeliveryStatus === 'success' && (
                  <p className="text-sm text-green-600 mt-2">✓ Join code sent to email</p>
                )}
                {emailDeliveryStatus === 'error' && (
                  <p className="text-sm text-red-600 mt-2">⚠ Email delivery failed</p>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 text-center mb-6">
              Write this code down! You'll need it to connect other devices.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Continue to App
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => setMode(null)}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-center mb-4 text-purple-900">
            Create Family
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your email to receive the family join code.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-purple-500 focus:outline-none"
            disabled={loading}
          />

          <button
            onClick={() => handleCreate(parentEmail)}
            disabled={loading || !parentEmail.includes('@')}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Family'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Optional: Email will be used to send your family join code.
          </p>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => setMode(null)}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-center mb-4 text-purple-900">
            Join Family
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter the 6-character code, or request it via email.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Don't have your code? Get it by email:
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                disabled={joinEmailStatus === 'sending'}
              />
              <button
                onClick={handleRequestJoinCode}
                disabled={joinEmailStatus === 'sending' || !joinEmail.includes('@')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {joinEmailStatus === 'sending' ? 'Sending...' : 'Send Code'}
              </button>
            </div>
            {joinEmailStatus === 'sent' && (
              <p className="text-sm text-green-600 mt-2">
                If a family exists with that email, a join code has been sent.
              </p>
            )}
            {joinEmailStatus === 'error' && (
              <p className="text-sm text-red-600 mt-2">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter join code"
            maxLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-center text-2xl font-bold tracking-widest uppercase"
          />

          <button
            onClick={handleJoin}
            disabled={loading || joinCode.length !== 6}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Family'}
          </button>
        </div>
      </div>
    )
  }
}
