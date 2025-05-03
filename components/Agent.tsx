import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'


enum CallStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    CONNECTING = 'CONNECTING',
    FINISHED = 'FINISHED',
}

const Agent = ({ userName }: AgentProps) => {
    const isSpeaking = true;
    const callStatus = CallStatus.ACTIVE; 
    const massage = [
        'Whats your name?',
        'My name is Suchit, Nice to meet you!',
    ];
    const lastMessage = massage[massage.length - 1];

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
        {massage.length > 0 && (
            <div className='transcript-border'>
                <div className='transcript'>
                    <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')} > 
                        {lastMessage}
                    </p>
                </div>

            </div>
        )}

        <div className='w-full flex justify-center'>
            {callStatus !== 'ACTIVE' ? (
                <button className='relative btn-call'>
                    <span className={cn('absolute rounded-full animate-ping opacity-75', callStatus !== 'CONNECTING' & 'hidden')}
                    />
                    <span>
                        {callStatus === 'INACTIVE' || callStatus==='FINISHED'? 'Call' : '. . .'}
                    </span>
                </button>
            ): (
                <button className='btn-disconnect'>
                    <span>End Call</span>
                </button>
            ) }
        </div>
    </>
  )
}

export default Agent
