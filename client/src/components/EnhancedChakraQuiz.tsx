import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { chakras } from "@/lib/chakras";
import { 
  ChakraQuestion, 
  QuestionOption, 
  generateQuestions, 
  getOptionsForQuestion as getOptions,
  getStepTitle,
  getStepDescription
} from "@/lib/chakraQuestionGenerator";

interface EnhancedChakraQuizProps {
  onComplete: (values: Record<string, number>) => void;
  isSubmitting: boolean;
}

// Generate dynamic questions for the 5-step chakra assessment
const questionsByStep: ChakraQuestion[][] = generateQuestions();

export default function EnhancedChakraQuiz({ onComplete, isSubmitting }: EnhancedChakraQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepComplete, setStepComplete] = useState<boolean[]>(Array(questionsByStep.length).fill(false));
  
  // Determine if current question has been answered
  const currentQuestion = questionsByStep[currentStep][currentQuestionIndex];
  const currentQuestionAnswered = !!answers[currentQuestion?.id];
  
  // Calculate total questions and progress
  const totalQuestionsInStep = questionsByStep[currentStep].length;
  const currentProgress = ((currentQuestionIndex + 1) / totalQuestionsInStep) * 100;
  
  // Calculate overall progress across all steps
  const totalQuestions = questionsByStep.reduce((acc, step) => acc + step.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const overallProgress = (answeredQuestions / totalQuestions) * 100;
  
  // Handle answer selection
  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-advance to next question after short delay
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestionsInStep - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setStepComplete(prev => {
          const newStepComplete = [...prev];
          newStepComplete[currentStep] = true;
          return newStepComplete;
        });
        
        // If there are more steps, advance to next step
        if (currentStep < questionsByStep.length - 1) {
          setCurrentStep(currentStep + 1);
          setCurrentQuestionIndex(0);
        }
      }
    }, 300);
  };
  
  // Handle previous question/step navigation
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentQuestionIndex(questionsByStep[currentStep - 1].length - 1);
    }
  };
  
  // Calculate chakra values from answers
  const calculateChakraValues = () => {
    const chakraScores: Record<string, number[]> = {
      root: [],
      sacral: [],
      solarPlexus: [],
      heart: [],
      throat: [],
      thirdEye: [],
      crown: []
    };
    
    // Process all answers
    Object.entries(answers).forEach(([questionId, value]) => {
      // Find the question
      for (const step of questionsByStep) {
        const question = step.find(q => q.id === questionId);
        if (question) {
          // Specific chakra or all chakras
          const numerical = parseInt(value, 10);
          const score = question.inverseScoring ? 6 - numerical : numerical;
          
          if (question.chakra === 'all') {
            // Apply to all chakras
            Object.keys(chakraScores).forEach(chakra => {
              chakraScores[chakra].push(score);
            });
          } else {
            // Apply to specific chakra
            chakraScores[question.chakra].push(score);
          }
          break;
        }
      }
    });
    
    // Calculate average for each chakra and scale to 1-10
    const result: Record<string, number> = {};
    Object.entries(chakraScores).forEach(([chakra, scores]) => {
      if (scores.length === 0) {
        result[chakra] = 5; // Default if no scores
      } else {
        const avg = scores.reduce((sum, curr) => sum + curr, 0) / scores.length;
        // Scale from 1-5 to 1-10
        result[chakra] = Math.round((avg * 2) * 10) / 10;
      }
    });
    
    return result;
  };
  
  // Handle completion of assessment
  const handleComplete = () => {
    const chakraValues = calculateChakraValues();
    onComplete(chakraValues);
  };
  
  // Check if assessment is complete
  const isAssessmentComplete = stepComplete.every(step => step);
  
  // Use step title from the library
  const stepTitle = getStepTitle(currentStep);
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-500">
            Step {currentStep + 1} of {questionsByStep.length}
          </span>
          <span className="text-sm text-neutral-500">
            Question {currentQuestionIndex + 1} of {totalQuestionsInStep}
          </span>
        </div>
        <Progress value={currentProgress} className="h-2" />
        
        <div className="flex justify-between mt-2">
          {questionsByStep.map((_, index) => (
            <div 
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                index < currentStep 
                  ? "bg-green-100 text-green-600 border border-green-300" 
                  : index === currentStep 
                    ? "bg-[#483D8B] text-white"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Current question card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle>{stepTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-6">{currentQuestion.text}</h3>
              
              <RadioGroup 
                value={answers[currentQuestion.id] || ""}
                className="space-y-3"
                onValueChange={handleAnswer}
              >
                {getOptions(currentQuestion).map((option) => (
                  <div key={option.value} className="flex items-start space-x-2 border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors">
                    <div className="pt-1">
                      <RadioGroupItem 
                        value={option.value} 
                        id={`${currentQuestion.id}-${option.value}`}
                      />
                    </div>
                    <Label 
                      htmlFor={`${currentQuestion.id}-${option.value}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-neutral-500 mt-1">{option.description}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0 && currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {(currentStep === questionsByStep.length - 1 && 
             currentQuestionIndex === totalQuestionsInStep - 1 && 
             currentQuestionAnswered) && (
            <Button 
              onClick={handleComplete}
              className="bg-[#483D8B] hover:bg-opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Complete Assessment
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Assessment summary card (visible when complete) */}
      {isAssessmentComplete && (
        <Card className="bg-neutral-50 border-dashed">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Assessment Progress</h3>
            <Progress value={overallProgress} className="h-3 mb-4" />
            <p className="text-neutral-600 text-sm">
              You've completed {Math.round(overallProgress)}% of the assessment. Review your answers or complete any remaining questions to receive your chakra profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}