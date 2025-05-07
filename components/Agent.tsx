'use client';

import React, { use } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { vapi } from '@/lib/vapi.sdk';


enum CallStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    CONNECTING = 'CONNECTING',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setcallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]); 

    useEffect(() => {
        const onCallStart = () => setcallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setcallStatus(CallStatus.FINISHED);

        const onMassage = (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = {
                    role: message.role,
                    content: message.transcript,
                }

                setMessages((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.error('Error',error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMassage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMassage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    },[]);

    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) router.push('/');
    }, [messages, callStatus, type, userId]);

    const handleCall = async() => {
        setcallStatus(CallStatus.CONNECTING);

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
                userName: userName,
                userId: userId,
            }
        })
    }

    const handleDisconnect = async() => {
        setcallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content;

    const isCallInactiveorFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
    const isCallActive = callStatus === CallStatus.ACTIVE;

  return (
    <>
        <div className='call-view'>
        <div className='card-interviewer'>
            <div className='avatar'>
                <Image src='/ai-avatar.png' alt='vapi' width={65} height={54} className='object-cover' />
                {isSpeaking && <div className='animate-speak'></div>}
            </div>
            <h3>AI Interviewer</h3>
        </div>

        <div className='card-border'>
            <div className='card-content'>
                <Image src='/user-avatar.png' alt='user avatar' width={540} height={540} className='object-cover rounded-full size-[120px]' />
                <h3>{userName}</h3>
            </div>
        </div>
        </div>
        {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

        <div className='w-full flex justify-center'>
            {callStatus !== 'ACTIVE' ? (
                <button className='relative btn-call' onClick={handleCall}>
                    <span className={cn('absolute rounded-full animate-ping opacity-75', callStatus !== 'CONNECTING' && 'hidden')}
                    />
                    <span>
                        {isCallInactiveorFinished ? 'Call' : '. . .'}
                    </span>
                </button>
            ): (
                <button className='btn-disconnect' onClick={handleDisconnect}>
                    <span>End Call</span>
                </button>
            ) }
        </div>
    </>
  )
}

export default Agent
