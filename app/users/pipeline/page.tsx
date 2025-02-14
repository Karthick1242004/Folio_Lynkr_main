"use client"

import * as React from "react"
import { ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { PageNavigation } from "@/components/PageNav/PageNavigation"
import { useStore } from "@/store/store"
import confetti from 'canvas-confetti'
import axios from 'axios'
import { useEffect } from "react"
import Footer from "@/components/Footer/Footer"

interface Step {
  name: string
  duration: string
  status: "completed" | "in-progress" | "pending" | "failed"
  details?: string
  isExpanded?: boolean
  startTime?: number // when this step starts in the sequence
}

export default function Page() {
  const [elapsedTime, setElapsedTime] = React.useState(0)
  const [stepTimers, setStepTimers] = React.useState<{ [key: number]: number }>({})
  const [isRunning, setIsRunning] = React.useState(true)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [deployUrl, setDeployUrl] = React.useState<string | null>(null)
  const { isNavOpen, setIsNavOpen, isDark, subdomain } = useStore()

  const initialSteps: Step[] = [
    { 
      name: "Set up job", 
      duration: "8s", 
      status: "pending",
      details: "Initialized build environment and configured workspace",
      startTime: 0
    },
    { 
      name: "Checkout Code", 
      duration: "6s", 
      status: "pending",
      details: "Cloning repository and checking out branch",
      startTime: 5
    },
    { 
      name: "Setup Node.js", 
      duration: "8s", 
      status: "pending",
      details: "Installing and configuring Node.js environment",
      startTime: 8
    },
    { 
      name: "Install Dependencies", 
      duration: "15s", 
      status: "pending",
      details: "Installing npm packages and resolving dependencies",
      startTime: 12
    },
    { 
      name: "Build the Website", 
      duration: "10s", 
      status: "pending",
      details: "Compiling and bundling application",
      startTime: 27
    },
    { 
      name: "Install Netlify CLI", 
      duration: "7s", 
      status: "pending",
      details: "Setting up deployment tools",
      startTime: 37
    },
    { 
      name: "Deploy to Netlify", 
      duration: "8s", 
      status: "pending",
      details: "Uploading and deploying to production",
      startTime: 42
    }
  ]

  const [steps, setSteps] = React.useState(initialSteps)

  // Trigger confetti when deployment completes
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#574EFA', '#4A3FF7', '#1A1E3C']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#574EFA', '#4A3FF7', '#1A1E3C']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Single API call effect that triggers at 42 seconds
   useEffect(() => {
    if (elapsedTime === 42) {
      const fetchDeployedUrl = async () => {
        try {
          const response = await axios.get('https://folio4ubackend-production.up.railway.app/get-subdomain');
          console.log("API Response:", response.data);
          if (response.data.subdomain) {
            setDeployUrl(response.data.subdomain);
          }
        } catch (error) {
          console.error('Error fetching subdomain:', error);
        }
      };
      fetchDeployedUrl();
    }
  }, [elapsedTime]);

  // Timer effect
  React.useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= 50) {
          setIsRunning(false);
          setShowSuccess(true);
          triggerConfetti();
          clearInterval(timer);
          return 62;
        }
        return prev + 1;
      });

      // Update individual step timers
      setStepTimers(prev => {
        const newTimers = { ...prev };
        steps.forEach((step, index) => {
          const stepDuration = parseInt(step.duration);
          const endTime = step.startTime! + stepDuration;

          if (elapsedTime >= step.startTime! && elapsedTime < endTime) {
            newTimers[index] = (prev[index] || 0) + 1;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, steps, elapsedTime]);

  React.useEffect(() => {
    setSteps(prevSteps =>
      prevSteps.map(step => {
        const stepDuration = parseInt(step.duration)
        const endTime = step.startTime! + stepDuration

        if (elapsedTime >= step.startTime! && elapsedTime < endTime) {
          return { ...step, status: "in-progress" }
        } else if (elapsedTime >= endTime) {
          return { ...step, status: "completed" }
        } else {
          return { ...step, status: "pending" }
        }
      })
    )
  }, [elapsedTime])

  const toggleStep = (index: number) => {
    setSteps(
      steps.map((step, i) => ({
        ...step,
        isExpanded: i === index ? !step.isExpanded : step.isExpanded,
      })),
    )
  }

  const getStatusIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
      case "in-progress":
        return <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Clock className="h-4 w-4 text-blue-500 flex-shrink-0" /></motion.div>
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
    }
  }

  const getStepProgress = (step: Step, index: number) => {
    if (step.status === "completed") {
      return step.duration
    }
    if (step.status === "in-progress") {
      return `${stepTimers[index] || 0}s`
    }
    return "0s"
  }

  return (
    <div className={`w-full pb-10 mx-auto px-6 ${isDark ? 'bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <PageNavigation 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
      />
      <div className="max-w-4xl mx-auto">
      <div className={cn(
        "rounded-xl shadow-lg p-6 ",
        isDark ? "bg-gray-800" : "bg-white"
      )}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={cn(
            "text-xl font-semibold",
            isDark && "text-white"
          )}>Deployment Pipeline</h2>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className={cn(
              "border rounded-lg",
              isDark ? "border-gray-700" : "border-gray-100"
            )}>
              <button
                onClick={() => toggleStep(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-50",
                  step.isExpanded && (isDark ? "bg-gray-700" : "bg-gray-50"),
                  step.isExpanded && "rounded-b-none",
                  isDark && "text-gray-100"
                )}
              >
                <motion.div
                  animate={{ rotate: step.isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )} />
                </motion.div>
                {getStatusIcon(step.status)}
                <span className="flex-grow text-left font-medium">{step.name}</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  step.status === "in-progress" 
                    ? isDark ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-700"
                    : isDark ? "bg-gray-600 text-gray-100" : "bg-gray-100 text-gray-700"
                )}>
                  {getStepProgress(step, index)}
                </span>
              </button>
              <AnimatePresence>
                {step.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "px-11 py-3 text-sm border-t rounded-b-lg",
                      isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-600 border-gray-100"
                    )}>
                      {step.details || "No additional details available"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mt-8 p-6 rounded-lg border-2 text-center",
                isDark 
                  ? "bg-gray-700 border-green-500 text-white" 
                  : "bg-white border-green-500"
              )}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className={cn(
                "text-2xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Deployment Complete!
              </h3>
              <p className={cn(
                "text-lg mb-4",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                Your website is now live at:
              </p>
              <a
                href={`https://${deployUrl || subdomain}.netlify.app`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-transform hover:scale-105",
                  "bg-gradient-to-r from-[#574EFA] to-[#4A3FF7]"
                )}
              >
                {`${deployUrl}.netlify.app`}
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      <Footer />
    </div>
  )
}


