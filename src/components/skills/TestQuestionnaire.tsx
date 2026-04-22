"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, CheckCircle, AlertCircle, ChevronRight, BrainCircuit } from "lucide-react";
import type { SkillTest, TestAttempt } from "@/lib/types/skills";

interface TestQuestionnaireProps {
  test: SkillTest;
  onComplete: (attempt: TestAttempt) => void;
  businessId: string;
}

export function TestQuestionnaire({ test, onComplete, businessId }: TestQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60);
  const [submitted, setSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState({ percentage: 0, points: 0, totalPoints: 0 });
  const [showReview, setShowReview] = useState(false);
  const isPaused = useRef(false);

  const question = test.questions[currentQuestion];

  const calculateWeightedScore = useCallback(() => {
    let earnedPoints = 0;
    let totalPossiblePoints = 0;

    test.questions.forEach((q) => {
      const weight = q.difficulty === "hard" ? 3 : q.difficulty === "medium" ? 2 : 1;
      totalPossiblePoints += weight;
      if (answers[q.id] === q.correctAnswer) {
        earnedPoints += weight;
      }
    });

    const percentage = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;
    return { percentage, points: earnedPoints, totalPoints: totalPossiblePoints };
  }, [answers, test.questions]);

  const handleSubmitTest = useCallback(() => {
    const data = calculateWeightedScore();
    setScoreData(data);
    setShowReview(true);
    setSubmitted(true);
  }, [calculateWeightedScore]);

  // Timer effect with visibility awareness
  useEffect(() => {
    if (submitted) return;

    const handleVisibilityChange = () => {
      isPaused.current = document.visibilityState !== "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const timer = setInterval(() => {
      if (isPaused.current) return;

      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitted, handleSubmitTest]);

  // Navigation Warning
  useEffect(() => {
    if (!submitted) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleConfirmSubmit = () => {
    const { percentage } = scoreData;
    const passed = percentage >= test.passingScore;
    const attempt: TestAttempt = {
      attemptId: `${test.testId}-${Date.now()}`,
      businessId,
      skillId: test.skillId,
      testId: test.testId,
      startedAt: Date.now() - (test.timeLimit * 60 - timeRemaining) * 1000,
      completedAt: Date.now(),
      answers: answers as Record<string, "a" | "b" | "c" | "d">,
      score: Math.round(percentage),
      percentageScore: percentage,
      passed,
      certificateId: passed ? `cert-${Date.now()}` : undefined,
    };
    onComplete(attempt);
  };

  if (submitted && showReview) {
    const passed = scoreData.percentage >= test.passingScore;
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in duration-500">
        <div className={`rounded-3xl border-2 p-6 sm:p-10 text-center ${
          passed ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
        }`}>
          <div className="mb-4 sm:mb-6 flex justify-center">
            {passed ? (
              <div className="rounded-full bg-emerald-100 p-4">
                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-600" />
              </div>
            )}
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight leading-tight ${passed ? "text-emerald-900" : "text-red-900"}`}>
            {passed ? "Certification Ready!" : "Skill Check Incomplete"}
          </h2>
          <p className={`mt-3 text-base sm:text-lg font-medium opacity-90 ${passed ? "text-emerald-800" : "text-red-800"}`}>
            {passed
              ? "Your proficiency has been verified. You can now claim your digital certificate."
              : `You achieved a weighted score of ${Math.round(scoreData.percentage)}%. Passing requires ${test.passingScore}%.`}
          </p>

          <div className="mt-8 flex justify-center gap-3 sm:gap-4">
            <div className="flex-1 max-w-[160px] rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Score</div>
              <div className="text-3xl sm:text-5xl font-black text-navy">{Math.round(scoreData.percentage)}%</div>
            </div>
            <div className="flex-1 max-w-[160px] rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Accuracy</div>
              <div className="text-3xl sm:text-5xl font-black text-navy">
                {Object.values(answers).filter((ans, idx) => ans === test.questions[idx]?.correctAnswer).length}/{test.questions.length}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="text-navy h-5 w-5" />
            <h3 className="text-base sm:text-lg font-black uppercase tracking-widest text-navy">Technical Review</h3>
          </div>
          {test.questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={`rounded-2xl border-2 p-5 sm:p-6 transition-all ${
                  isCorrect ? "border-emerald-100 bg-emerald-50/20" : "border-red-100 bg-red-50/20"
                }`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 h-6 w-6 rounded-full font-black text-white flex items-center justify-center text-[10px] shrink-0 ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                      <p className="font-bold text-navy leading-tight text-sm sm:text-base">
                        {idx + 1}. {q.question}
                      </p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border whitespace-nowrap ${
                        q.difficulty === 'hard' ? 'border-red-200 text-red-600' : 'border-blue-200 text-blue-600'
                      }`}>
                        {q.difficulty} (+{q.difficulty === 'hard' ? '3' : q.difficulty === 'medium' ? '2' : '1'} PTS)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Response: <span className={`font-black ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>{userAnswer?.toUpperCase() || 'SKIPPED'}</span>
                      {!isCorrect && (
                        <span className="ml-2 font-black text-emerald-700">| Correct: {q.correctAnswer.toUpperCase()}</span>
                      )}
                    </p>
                    <div className="mt-4 p-4 rounded-xl bg-white/50 border border-gray-100/50 text-[11px] sm:text-xs italic text-gray-500 leading-relaxed shadow-inner">
                      <strong>Rationale:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              setShowReview(false);
              setSubmitted(false);
              setCurrentQuestion(0);
              setAnswers({});
              setTimeRemaining(test.timeLimit * 60);
            }}
            className="flex-1 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:border-navy hover:text-navy transition-all active:scale-95"
          >
            Reset & Retry
          </button>
          <button
            onClick={handleConfirmSubmit}
            className={`flex-1 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
              passed ? "bg-navy shadow-navy/20" : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!passed}
          >
            {passed ? "Issue Certificate →" : "Score too low to certify"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Live Skill Assessment</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-navy tracking-tight leading-tight">{test.skillName}</h2>
        </div>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-lg transition-colors shadow-premium-sm ${timeRemaining < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-navy text-white'}`}>
          <Clock className={timeRemaining < 60 ? 'animate-spin-slow' : ''} />
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute inset-y-0 left-0 bg-navy transition-all duration-1000 ease-out-expo"
          style={{ width: `${((currentQuestion + 1) / test.totalQuestions) * 100}%` }}
        />
      </div>

      <div className="rounded-[2rem] sm:rounded-[2.5rem] border-2 border-gray-100 p-6 sm:p-10 bg-white shadow-3xl shadow-gray-200/40">
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-blue-50/50 border border-blue-100 decoration-blue-200 decoration-dotted">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Operational Scenario</p>
          <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed italic">&quot;{question.scenario}&quot;</p>
        </div>

        <h3 className="text-lg sm:text-2xl font-black text-navy leading-snug mb-8">{question.question}</h3>

        <div className="grid gap-3 sm:gap-4">
          {["a", "b", "c", "d"].map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`group flex items-center gap-4 sm:gap-6 rounded-2xl border-2 p-5 sm:p-6 min-h-[72px] transition-all duration-500 active:scale-98 ${
                answers[question.id] === option
                  ? "border-navy bg-navy/5 shadow-premium-sm"
                  : "border-gray-50 bg-white sm:hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl border-2 font-black flex items-center justify-center flex-shrink-0 transition-all ${
                answers[question.id] === option ? "bg-navy text-white border-navy" : "border-gray-100 text-gray-300"
              }`}>
                {option.toUpperCase()}
              </div>
              <p className={`text-left text-sm sm:text-base font-bold transition-colors ${answers[question.id] === option ? 'text-navy' : 'text-gray-600'}`}>
                {question.options[option as "a" | "b" | "c" | "d"]}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="h-14 sm:h-16 px-6 sm:px-10 rounded-2xl border-2 border-gray-100 font-black uppercase tracking-widest text-gray-300 sm:hover:text-navy sm:hover:border-navy disabled:opacity-30 transition-all active:scale-95"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">←</span>
        </button>

        <div className="hidden lg:flex gap-2">
          {test.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`h-10 w-10 rounded-xl font-black transition-all ${
                idx === currentQuestion ? "bg-navy text-white scale-110 shadow-lg" : 
                answers[test.questions[idx].id] ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-300"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <div className="lg:hidden text-xs font-black text-gray-300 py-3 uppercase tracking-widest">{currentQuestion + 1} / {test.totalQuestions}</div>
        </div>
        
        <div className="lg:hidden text-xs font-black text-gray-400 uppercase tracking-[0.3em]">SEGMENT {currentQuestion + 1} / {test.totalQuestions}</div>

        <button
          onClick={currentQuestion === test.questions.length - 1 ? handleSubmitTest : handleNextQuestion}
          disabled={currentQuestion === test.questions.length - 1 ? Object.keys(answers).length !== test.questions.length : !answers[question.id]}
          className="h-14 sm:h-16 px-6 sm:px-10 rounded-2xl bg-navy text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
        >
          <span className="hidden sm:inline">{currentQuestion === test.questions.length - 1 ? "Evaluate Final" : "Next Segment"}</span>
          <span className="sm:hidden">{currentQuestion === test.questions.length - 1 ? "FINISH" : "NEXT"}</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {currentQuestion === test.questions.length - 1 && Object.keys(answers).length !== test.questions.length && (
        <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 flex gap-4 animate-in slide-in-from-bottom-4">
          <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-black text-orange-900 uppercase tracking-widest text-[10px] mb-1">Incomplete Assessment</p>
            <p className="text-xs sm:text-sm text-orange-800 font-medium leading-relaxed">
              You have {test.questions.length - Object.keys(answers).length} unanswered items. Professional certification requires a full completion of all technical segments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
