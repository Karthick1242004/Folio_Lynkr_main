import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, onStepClick }) => {
  const steps = [
    { number: 1, title: 'SITE DETAILS' },
    { number: 2, title: 'SOCIAL LINKS' },
    { number: 3, title: 'HERO SECTION' },
    { number: 4, title: 'SERVICES' },
    { number: 5, title: 'TESTIMONAILS' },
    { number: 6, title: 'CONTACT INFO' },
    { number: 7, title: 'ACADEMIC DETAILS' },
  ];

  return (
    <div className="relative min-h-[600px] w-full md:w-72 bg-[#574EFA] rounded-lg p-8 bg-gradient-to-b from-[#574EFA] to-[#4A3FF7]">
      <div className="space-y-8">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className="flex items-center gap-4 cursor-pointer hover:opacity-90" 
            onClick={() => onStepClick(step.number)}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${currentStep === step.number
                ? 'bg-white text-[#574EFA] border-white'
                : 'border-white/50 text-white'}`}
            >
              {step.number}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/60">STEP {step.number}</span>
              <span className="text-sm font-medium text-white">{step.title}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="w-full h-20 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-18%20at%201.09.48%E2%80%AFPM-pk0cWu57s5VXrEV44oTzlMNRXeB1L2.png')] bg-contain bg-no-repeat bg-bottom opacity-50" />
      </div>
    </div>
  );
};

export default ProgressBar;

