'use client';
import {
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as ToastContent,
  type ToastProps,
  Text,
} from 'react-aria-components/Toast';
import {Button} from '../form/Button';
import { RiCloseLine, RiCheckboxCircleFill  , RiErrorWarningFill   , RiCloseCircleFill  , RiInformationFill } from '@remixicon/react';
import '@styles/statusToast.css';
import {flushSync} from 'react-dom';
import { type CSSProperties } from 'react';

// Define the type for your toast content. This interface defines the properties of your toast content, affecting what you
// pass to the queue calls as arguments.
interface MyToastContent {
  title: string;
  description?: string;
  color?: 'success' | 'error' | 'warning' | 'info';
}

// This is a global toast queue, to be imported and called where ever you want to queue a toast via queue.add().
export const queue = new ToastQueue<MyToastContent>({
  // Wrap state updates in a CSS view transition.
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  }
});

export function StatusToast() {
  return (
    // The ToastRegion should be rendered at the root of your app.
    <ToastRegion className='toast-region' queue={queue}>
      {({toast}) => (
        <MyToast toast={toast} className={`toast-container flex items-center justify-between toast-${toast.content.color}`} style={{viewTransitionName: toast.key} as CSSProperties}>
          <ToastContent className='react-aria-ToastContent flex items-center gap-2'>
            {(() => {
              switch(toast.content.color){
                case 'success':
                  return <RiCheckboxCircleFill size={40} className='toast-icon' />;
                case 'warning':
                  return <RiErrorWarningFill size={40} className='toast-icon' />;
                case 'error':
                  return <RiCloseCircleFill size={40} className='toast-icon' />;
                case 'info':
                  return <RiInformationFill size={40} className='toast-icon' />;
              }
            })()}
            <div className='flex flex-col'>
              <Text className='text-[var(--color-text-light)] text-lg font-semibold'>{toast.content.title}</Text>
              {toast.content.description && (
                <Text className='text-[var(--color-text-light)] text-sm'>{toast.content.description}</Text>
              )}
            </div>
          </ToastContent>
          <Button slot="close" aria-label="Close" variant="quiet">
             < RiCloseLine  /> 
          </Button>
        </MyToast>
      )}
    </ToastRegion>
  );
}

export function MyToast(props: ToastProps<MyToastContent>) {
  return <Toast {...props} />;
}
