'use client'

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DynamicForm } from '@/components/DynamicForm/DynamicForm';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FormBuilder() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');
  const formId = searchParams.get('formId');
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('github');
    }
  }, [status]);
  
  useEffect(() => {
    if (!siteId || !formId) {
      router.push('/');
    }
  }, [siteId, formId, router]);
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!siteId || !formId) {
    return null;
  }
  
  return (
    <div>
      <DynamicForm formId={parseInt(formId)} siteId={parseInt(siteId)} />
    </div>
  );
} 