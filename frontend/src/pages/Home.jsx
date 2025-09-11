"use client"

import { useContext, useEffect, useRef, useState } from "react"
import { userDataContext } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import { FiEye, FiEyeOff, FiTrash2, FiSettings, FiLogOut, FiMic, FiMicOff } from "react-icons/fi"
import { BsRobot } from "react-icons/bs"
import userImg from "../assets/user.gif"

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const clearHistory = () => {
    setUserData((prev) => ({ ...prev, history: [] }))
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start()
        console.log("Recognition requested to start")
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error)
        }
      }
    }
  }

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = "hi-IN"
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find((v) => v.lang === "hi-IN")
    if (hindiVoice) {
      utterence.voice = hindiVoice
    }

    isSpeakingRef.current = true
    utterence.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      setTimeout(() => {
        startRecognition()
      }, 800)
    }
    synth.cancel()
    synth.speak(utterence)
  }

  const handleCommand = (data) => {
    const { type, userInput, response } = data
    speak(response)

    if (type === "google-search") {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, "_blank")
    }
    if (type === "calculator-open") {
      window.open(`https://www.google.com/search?q=calculator`, "_blank")
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, "_blank")
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, "_blank")
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, "_blank")
    }

    if (type === "youtube-search" || type === "youtube-play") {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank")
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognitionRef.current = recognition

    let isMounted = true

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start()
          console.log("Recognition requested to start")
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e)
          }
        }
      }
    }, 1000)

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              console.log("Recognition restarted")
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e)
            }
          }
        }, 1000)
      }
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error)
      isRecognizingRef.current = false
      setListening(false)
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start()
              console.log("Recognition restarted after error")
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e)
            }
          }
        }, 1000)
      }
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false
        setListening(false)
        const data = await getGeminiResponse(transcript)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    }

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
    greeting.lang = "hi-IN"

    window.speechSynthesis.speak(greeting)

    return () => {
      isMounted = false
      clearTimeout(startTimeout)
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg">
                <BsRobot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Voice Assistant</h1>
                <p className="text-sm text-slate-600">AI-Powered Assistant</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                {listening ? (
                  <FiMic className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FiMicOff className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {listening ? "Listening" : "Inactive"}
                </span>
              </div>
              
              <button
                onClick={() => navigate("/customize")}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                <span>Customize</span>
              </button>
              
              <button
                onClick={handleLogOut}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setHam(true)}
            >
              <CgMenuRight className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          ham ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setHam(false)} />
        <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
          ham ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
              <button
                onClick={() => setHam(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RxCross1 className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <nav className="space-y-4">
              <button
                onClick={() => {
                  navigate("/customize")
                  setHam(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                <FiSettings className="w-5 h-5" />
                <span>Customize Assistant</span>
              </button>
              
              <button
                onClick={() => {
                  handleLogOut()
                  setHam(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">History</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {showHistory ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={clearHistory}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showHistory && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {userData.history?.length > 0 ? (
                    userData.history.map((his, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700"
                      >
                        {his}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm italic text-center py-4">No history available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Instructions */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Usage Instructions</h3>
              <p className="text-blue-800 text-sm">
                Always use your Assistant's name in each command that you give to the Assistant.
              </p>
            </div>
          </div>
        </div>

        {/* Assistant Interface */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg border-4 border-slate-100 mb-6">
            <img
              src={userData?.assistantImage || "/placeholder.svg"}
              alt="Assistant"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            I'm {userData?.assistantName}
          </h2>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${listening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-slate-600 font-medium">
              {listening ? "Listening..." : "Say my name to get started"}
            </span>
          </div>

          {/* Current Interaction */}
          {(userText || aiText) && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-start space-x-4">
                  {!aiText && (
                    <img src={userImg || "/placeholder.svg"} alt="User" className="w-12 h-12 rounded-full flex-shrink-0" />
                  )}
                  {aiText && (
                    <img src={aiImg || "/placeholder.svg"} alt="AI" className="w-12 h-12 rounded-full flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-slate-800 leading-relaxed">{userText || aiText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Indicators */}
          {!userText && !aiText && (
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-2 transition-colors ${
                  listening ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                }`}>
                  {listening ? (
                    <FiMic className="w-8 h-8  text-emerald-600" />
                  ) : (
                    <FiMicOff className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium">Voice Recognition</p>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Conversation History</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {showHistory ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  <span>{showHistory ? "Hide" : "Show"}</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>

          {showHistory && (
            <div className="p-6">
              {userData.history?.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {userData.history.map((his, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {his}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BsRobot className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">No conversations yet</h4>
                  <p className="text-slate-600">Your conversation history will appear here once you start talking with your assistant.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home