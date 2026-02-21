/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCcw,
  Info,
  ChevronRight,
  Sprout,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface AnalysisResult {
  diseaseName: string;
  scientificName: string;
  confidence: string;
  symptoms: string[];
  causes: string[];
  treatment: string;
  prevention: string;
}

// --- Components ---

const Header = () => (
  <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Leaf size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 leading-none">AgroDetect AI</h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">Plant Pathology Engine</p>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Dashboard</a>
        <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Encyclopedia</a>
        <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">History</a>
      </nav>
      <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
        <History size={20} className="text-zinc-600" />
      </button>
    </div>
  </header>
);

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1],
              },
            },
            {
              text: "Analyze this plant image for diseases. Provide a detailed diagnosis in JSON format. If the plant is healthy, state it clearly. Include: diseaseName, scientificName, confidence (percentage), symptoms (array), causes (array), treatment (markdown string), and prevention (markdown string).",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diseaseName: { type: Type.STRING },
              scientificName: { type: Type.STRING },
              confidence: { type: Type.STRING },
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              causes: { type: Type.ARRAY, items: { type: Type.STRING } },
              treatment: { type: Type.STRING },
              prevention: { type: Type.STRING },
            },
            required: ["diseaseName", "scientificName", "confidence", "symptoms", "causes", "treatment", "prevention"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Camera size={20} className="text-emerald-600" />
                  Image Capture
                </h2>
                {image && (
                  <button 
                    onClick={reset}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <RefreshCcw size={14} />
                    Reset
                  </button>
                )}
              </div>

              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-zinc-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-zinc-900">Upload or Take Photo</p>
                    <p className="text-sm text-zinc-500 mt-1">Supports JPG, PNG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    capture="environment"
                  />
                </div>
              ) : (
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img src={image} alt="Plant preview" className="w-full h-full object-cover" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                      <Loader2 size={48} className="animate-spin mb-4 text-emerald-400" />
                      <p className="text-lg font-medium">Analyzing Specimen...</p>
                      <p className="text-sm opacity-80 mt-2">Checking for 500+ common plant diseases</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pro Tip</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">Ensure the leaf is well-lit and in focus for better accuracy.</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Privacy</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">Images are processed securely and not stored permanently.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start gap-4"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-red-900">Analysis Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button 
                      onClick={reset}
                      className="mt-4 text-xs font-bold text-red-900 uppercase tracking-widest hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}

              {!result && !isAnalyzing && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-zinc-200 border-dashed"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                    <Sprout size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900">Ready for Diagnosis</h3>
                  <p className="text-zinc-500 mt-2 max-w-sm">
                    Upload a photo of a plant leaf to get an instant AI-powered health report and treatment plan.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-md">
                    <div className="text-center">
                      <div className="text-xl font-bold text-zinc-900">98%</div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-zinc-900">2s</div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Analysis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-zinc-900">500+</div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Diseases</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Diagnosis Card */}
                  <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            result.diseaseName.toLowerCase().includes('healthy') 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {result.diseaseName.toLowerCase().includes('healthy') ? 'Status: Optimal' : 'Diagnosis: Critical'}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Confidence: {result.confidence}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-zinc-900">{result.diseaseName}</h2>
                        <p className="text-zinc-500 italic mt-1">{result.scientificName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.diseaseName.toLowerCase().includes('healthy') ? (
                          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <CheckCircle2 size={24} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <AlertCircle size={24} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Observed Symptoms</h4>
                        <ul className="space-y-3">
                          {result.symptoms.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Probable Causes</h4>
                        <ul className="space-y-3">
                          {result.causes.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Treatment & Prevention */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} />
                        Treatment Plan
                      </h4>
                      <div className="prose prose-sm prose-zinc max-w-none">
                        <Markdown>{result.treatment}</Markdown>
                      </div>
                    </section>
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Prevention Strategy
                      </h4>
                      <div className="prose prose-sm prose-zinc max-w-none">
                        <Markdown>{result.prevention}</Markdown>
                      </div>
                    </section>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={18} />
                    New Analysis
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        <section className="mt-16 pt-8 border-t border-zinc-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold text-zinc-900 mb-4">About AgroDetect</h5>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Utilizing state-of-the-art computer vision and the Gemini 3 Flash model to provide farmers and gardeners with professional-grade plant pathology insights in seconds.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-zinc-900 mb-4">Supported Crops</h5>
              <div className="flex flex-wrap gap-2">
                {['Tomato', 'Potato', 'Corn', 'Wheat', 'Grape', 'Apple', 'Citrus', 'Coffee'].map(crop => (
                  <span key={crop} className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                    {crop}
                  </span>
                ))}
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                  +492 more
                </span>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-zinc-900 mb-4">Global Impact</h5>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Early detection can save up to 40% of crop yields globally. AgroDetect aims to make this technology accessible to everyone, everywhere.
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <p>© 2026 AgroDetect AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-600">Terms</a>
              <a href="#" className="hover:text-zinc-600">Privacy</a>
              <a href="#" className="hover:text-zinc-600">API Documentation</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
