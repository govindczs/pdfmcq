import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { Quiz } from './components/Quiz';
import { CameraProctor } from './components/CameraProctor';
import { extractTextFromPDF } from './lib/pdf';
import { generateMCQs, type MCQ } from './lib/gemini';
import { BrainCircuit, AlertCircle } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<'upload' | 'generating' | 'quiz'>('upload');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setAppState('generating');

      const text = await extractTextFromPDF(file);

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from the PDF. It might be scanned or protected.");
      }

      const questions = await generateMCQs(text);

      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate questions. Please try another document.");
      }

      setMcqs(questions);
      setAppState('quiz');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setAppState('upload');
    }
  };

  const handleRestart = () => {
    setMcqs([]);
    setAppState('upload');
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-900/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

      <header className="relative z-10 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center p-4 bg-primary-500/10 rounded-2xl mb-6 ring-1 ring-primary-500/20"
        >
          <BrainCircuit className="w-10 h-10 text-primary-400" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent"
        >
          PDF to Quiz AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Transform any document into an interactive learning experience instantly.
        </motion.p>
      </header>

      <main className="relative z-10 w-full flex-grow flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400 max-w-2xl w-full"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {appState === 'upload' || appState === 'generating' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="space-y-8 w-full">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isProcessing={appState === 'generating'}
                />

                {appState === 'upload' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xs mx-auto text-center bg-white/5 p-6 rounded-2xl border border-white/10"
                  >
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Optional Timer Limit (Minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={timerMinutes === 0 ? '' : timerMinutes}
                        placeholder="No limit"
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                        className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Leave blank or 0 for unlimited time</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full"
            >
              <Quiz questions={mcqs} onRestart={handleRestart} timerMinutes={timerMinutes} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CameraProctor />
    </div>
  );
}

export default App;
