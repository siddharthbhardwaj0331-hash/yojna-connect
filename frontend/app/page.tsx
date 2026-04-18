"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { ProgressBar } from "@/components/progress-bar"
import { FormStepComponent } from "@/components/form-step"
import { ResultsSection } from "@/components/results-section"
import { OceanBackground } from "@/components/ocean-background"
import Chatbot from "@/components/Chatbot"
import { FORM_STEPS, type UserProfile, type GovernmentScheme } from "@/lib/types"
import { apiUrl } from "@/lib/api-config"
import {
  incomeRangeToAnnualInr,
  mapCategory,
  mapOccupation,
  mapRecommendationToGovernmentScheme,
} from "@/lib/profile-mapping"
import { matchSchemesLocally } from "@/lib/local-scheme-match"

const initialProfile: UserProfile = {
  age: "",
  gender: "",
  state: "",
  occupation: "",
  income: "",
  category: "",
  education: "",
  maritalStatus: "",
  disabilities: ""
}

export default function YojnaAI() {

  // 🔥 LOGIN / SIGNUP
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // 🔥 MAIN APP
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [matchedSchemes, setMatchedSchemes] = useState<GovernmentScheme[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const currentStep = FORM_STEPS[currentStepIndex]

  const handleUpdate = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (currentStepIndex === FORM_STEPS.length - 1) {
      setIsLoading(true)

      try {
        const payload = {
          name: name || "User",
          age: Number(profile.age),
          annual_income: incomeRangeToAnnualInr(profile.income),
          occupation: mapOccupation(profile.occupation),
          state: profile.state,
          category: mapCategory(profile.category),
          gender: profile.gender,
        }

        const res = await fetch(apiUrl("/schemes/recommend"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        setAiSummary(data.ai_summary || null)

        const mapped = (data.recommended_schemes || []).map(
          (item: any, i: number) =>
            mapRecommendationToGovernmentScheme(item, i)
        )

        setMatchedSchemes(mapped.length ? mapped : matchSchemesLocally(profile))

      } catch {
        setMatchedSchemes(matchSchemesLocally(profile))
      } finally {
        setIsLoading(false)
      }

    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1)
  }

  const handleReset = () => {
    setProfile(initialProfile)
    setCurrentStepIndex(0)
    setMatchedSchemes(null)
  }

  // 🔥 LOGIN + SIGNUP SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">

        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl w-[420px] shadow-2xl">

          <h2 className="text-yellow-400 text-3xl font-bold mb-6 text-center">
            Yojna Connect 🤖
          </h2>

          <h3 className="text-center text-lg mb-4">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h3>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-3 rounded-xl bg-black/50"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl bg-black/50"
          />

          <button
            onClick={() => {
              if (!name || !email) return alert("Fill all fields")
              setIsLoggedIn(true)
            }}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold text-lg hover:scale-105 transition"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>

          <p
            onClick={() => setIsSignup(!isSignup)}
            className="text-center text-sm text-gray-400 mt-4 cursor-pointer hover:text-yellow-400"
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </p>

          <p className="text-xs text-gray-500 text-center mt-4">
            Made by Siddharth Bhardwaj
          </p>

        </div>
      </div>
    )
  }

  // 🔥 MAIN APP
  return (
    <main className="min-h-screen relative bg-black text-white">

      <OceanBackground />

      <div className="relative z-10">
        <Header />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-yellow-400">Loading...</p>
            </div>
          ) : matchedSchemes ? (
            <ResultsSection
              schemes={matchedSchemes}
              onReset={handleReset}
              aiSummary={aiSummary}
            />
          ) : (
            <>
              <ProgressBar
                currentStep={currentStepIndex}
                totalSteps={FORM_STEPS.length}
              />

              <FormStepComponent
                step={currentStep}
                profile={profile}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={currentStepIndex === 0}
                isLast={currentStepIndex === FORM_STEPS.length - 1}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      <Chatbot />

    </main>
  )
}