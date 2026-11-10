import { Button } from '@components/form/Button';
import { Form } from '@components/form/Form';
import { RiCheckLine } from '@remixicon/react';
import type { ReactNode } from 'react';
import { useState, createContext, useContext, useCallback } from 'react';

// Types
export interface Step {
  title: string;
  description?: string;
  children?: ReactNode;
}

interface StepperContextValue {
  currentStep: number;
  stepCount: number;
  orientation: 'horizontal' | 'vertical';
  steps: Step[];
  setStep: (step: number) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper context hooks must be used within a Stepper');
  }
  return context;
}

// Stepper Container
export interface StepperProps {
  steps: Step[];
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onStepChange?: (step: number) => void;
  children?: ReactNode;
}

export function Stepper({
  steps,
  currentStep: controlledCurrentStep,
  orientation = 'horizontal',
  className = '',
  onStepChange,
  children,
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(0);
  const isControlled = controlledCurrentStep !== undefined;
  const currentStep = isControlled ? controlledCurrentStep : internalStep;

  const setStep = useCallback(
    (step: number) => {
      if (!isControlled) {
        setInternalStep(step);
      }
      onStepChange?.(step);
    },
    [isControlled, onStepChange],
  );

  return (
    <StepperContext.Provider
      value={{steps, currentStep, stepCount: steps.length, orientation, setStep }}
    >
      <div className={`p-5 flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col '} h-full gap-10`}>
        <nav
          aria-label="Progress"
          role="navigation"
          className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col w-max'} ${className}`}
        >
          <ol
            className={`flex ${
              orientation === 'horizontal' ? 'flex-row w-full' : 'flex-col h-full w-max'
            } gap-0`}
          >
            {steps.map((step, index) => (
              <StepItem key={index} index={index} step={step} />
            ))}
          </ol>
        </nav>
        <div className={`w-full flex flex-col ${className}`}>
          {children}
        </div>
      </div>
    </StepperContext.Provider>
  );
}

// Individual Step Item
interface StepItemProps {
  index: number;
  step: Step;
}

function StepItem({ index, step }: StepItemProps) {
  const { currentStep, stepCount, orientation, setStep } = useStepperContext();

  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;
  const isLast = index === stepCount - 1;

  return (
    <li
      className={`relative flex ${
        orientation === 'horizontal' ? 'flex-row' : 'flex-col'
      } ${isLast ? '' : 'flex-1'}`}
    >
      {/* Step Indicator */}
      <button
        type="button"
        aria-current={isCurrent ? 'step' : undefined}
        aria-disabled={!isCompleted && !isCurrent}
        className={`group flex gap-4 items-center ${
          orientation === 'horizontal' ? 'flex-col' : 'flex-row items-start'
        }`}
        onClick={() => {
          if (isCompleted || isCurrent) {
            setStep(index);
          }
        }}
      >
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-base text-[var(--color-text)] font-medium transition-colors ${
            isCompleted
              ? 'bg-[var(--color-success)] border-[var(--color-success)]'
              : isCurrent
                ? 'bg-[var(--color-primary)]'
                : 'border-gray-300 bg-[var(--color-secondary)]'
          }`}
        >
          {isCompleted ? (
            <RiCheckLine className="w-4 h-4" />
          ) : (
            <span>{index + 1}</span>
          )}
        </span>

        {/* Step Label */}
        <span
          className={`${
            orientation === 'vertical' ? 'my-auto text-left' : 'text-center'
          }`}
        >
          <p
            className={`text-base font-medium ${
              isCurrent
                ? 'text-[var(--color-primary)]'
                : isCompleted
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-text)]'
            }`}
          >
            {step.title}
          </p>
          {step.description && (
            <p
              className={`text-sm text-[var(--color-text-muted)]`}
            >
              {step.description}
            </p>
          )}
        </span>
      </button>

      {/* Connector Line */}
      {!isLast && (
        <span
          className={`
            ${orientation === 'horizontal' ? 'flex-1 h-0.5 my-5 mx-2' : 'w-0.5 h-full mx-5 my-2'}
            ${
              index < currentStep
                ? 'bg-[var(--color-success)]'
                : 'bg-[var(--color-border)]'
            }
          `}
          aria-hidden="true"
        />
      )}
    </li>
  );
}

// Step Content Panel
export function StepContent({
  step,
  className = '',
  children,
  disableNextBtn,
  action
}: {
  step: number;
  className?: string;
  children: ReactNode;
  disableNextBtn?: boolean;
  action?: ((formData: FormData) => void | Promise<void>);
}) {
  const {steps, currentStep, stepCount, setStep } = useStepperContext();
  const isLastStep = currentStep === stepCount - 1;

  if(step !== currentStep) return null;

  return (
    <Form
      aria-label={`Step ${step + 1} form`}
      className='flex flex-col h-full gap-6'
      action={(formData) => {
        if(!disableNextBtn){
          if(action) action(formData);
          if(!isLastStep) setStep(currentStep + 1);
        }
      }
    }>
      <span className="pb-1 text-2xl border-b-2 border-[var(--color-border)]">{steps[currentStep].description}</span>
      <div className={`overflow-y-auto pr-3 h-full flex flex-col gap-4 ${className}`}>
        {children}
      </div>
      <StepperNavigation type="submit" disableNextBtn={disableNextBtn}/>
    </Form>
  );
}

// Navigation Buttons
export interface StepperNavigationProps {
  className?: string;
  type?: 'button' | 'submit';
  disableNextBtn?: boolean;
  nextStepAction?: () => void;
}

export function StepperNavigation({ className = '', type = 'button', disableNextBtn= false}: StepperNavigationProps) {
  const { currentStep, stepCount, setStep } = useStepperContext();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepCount - 1;

  return (
    <div className={`flex justify-between mt-auto ${className}`}>
      <Button
        type="button"
        isDisabled={isFirstStep}
        onPress={() => {
          setStep(currentStep - 1);
        }}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isFirstStep
            ? 'invisible'
            : 'text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer'
        }`}
      >
        Previous
      </Button>
      <Button
        type={type}
        isDisabled={disableNextBtn}
      >
        {isLastStep ? 'Finish' : 'Next'}
      </Button>
    </div>
  );
}
