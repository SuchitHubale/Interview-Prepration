import React from 'react'
import Loading from '@/components/loading'

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loading />
    </div>
  )
} 