import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Clock } from 'lucide-react';
import type { MCQ } from '../lib/gemini';

interface QuizProps {
    questions: MCQ[];
    onRestart: () => void;
    timerMinutes?: number;
}

export function Quiz({ questions, onRestart, timerMinutes }: QuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(timerMinutes ? timerMinutes * 60 : 0);

    useEffect(() => {
        if (timerMinutes && timerMinutes > 0 && !isFinished) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timerMinutes, isFinished]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentIndex];
    const hasAnswered = selectedAnswers[currentIndex] !== undefined;

    const handleSelectOption = (index: number) => {
        if (hasAnswered) return;
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: index }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        const score = Object.keys(selectedAnswers).reduce((acc, key) => {
            const qIndex = parseInt(key);
            return selectedAnswers[qIndex] === questions[qIndex].correctAnswerIndex ? acc + 1 : acc;
        }, 0);
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-10 rounded-3xl max-w-2xl w-full mx-auto text-center"
            >
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-30 rounded-full"></div>
                    <Award className="w-24 h-24 text-primary-400 relative z-10 mx-auto" />
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Quiz Complete!</h2>
                <p className="text-xl text-slate-300 mb-8">You scored <span className="text-white font-semibold">{score}</span> out of <span className="text-white font-semibold">{questions.length}</span> ({percentage}%)</p>

                <div className="space-y-4 text-left mb-10 max-h-[50vh] overflow-y-auto pr-2">
                    {questions.map((q, i) => {
                        const userAnswer = selectedAnswers[i];
                        const isQCorrect = userAnswer === q.correctAnswerIndex;
                        return (
                            <div key={i} className={`p-4 rounded-xl border ${isQCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                                <p className="text-sm text-slate-400">
                                    Your answer: {q.options[userAnswer]}
                                    {!isQCorrect && <span className="block text-green-400 mt-1">Correct answer: {q.options[q.correctAnswerIndex]}</span>}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={onRestart}
                    className="flex items-center justify-center space-x-2 w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-500 transition-colors text-white font-semibold text-lg"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Generate New Quiz</span>
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl w-full mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium tracking-wider uppercase text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                    {timerMinutes && timerMinutes > 0 && (
                        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-bold tracking-wider ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-primary-500/20 text-primary-400'}`}>
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-1">
                    {questions.map((_, idx) => (
                        <div key={idx} className={`h-1.5 w-8 rounded-full ${idx === currentIndex ? 'bg-primary-500' : idx < currentIndex ? 'bg-primary-500/40' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-8 md:p-12 rounded-3xl"
                >
                    <h2 className="text-2xl md:text-3xl font-medium mb-8 leading-snug">{currentQuestion.question}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedAnswers[currentIndex] === idx;
                            const isCorrectOption = currentQuestion.correctAnswerIndex === idx;

                            let optionClass = "border-white/10 hover:border-white/30 hover:bg-white/5";
                            let Icon = null;

                            if (hasAnswered) {
                                if (isCorrectOption) {
                                    optionClass = "border-green-500 bg-green-500/10 text-green-100";
                                    Icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
                                } else if (isSelected) {
                                    optionClass = "border-red-500 bg-red-500/10 text-red-100";
                                    Icon = <XCircle className="w-5 h-5 text-red-400" />;
                                } else {
                                    optionClass = "border-white/5 opacity-50";
                                }
                            } else if (isSelected) {
                                optionClass = "border-primary-500 bg-primary-500/20";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    disabled={hasAnswered}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${optionClass}`}
                                >
                                    <span className="text-lg">{option}</span>
                                    {Icon && <span>{Icon}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {hasAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 flex justify-end"
                        >
                            <button
                                onClick={handleNext}
                                className="flex items-center space-x-2 bg-white text-dark-900 px-8 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                            >
                                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
