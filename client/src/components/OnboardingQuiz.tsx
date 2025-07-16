import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { chakras } from "@/lib/chakras";

interface OnboardingQuizProps {
  onComplete: (chakraValues: Record<string, number>) => void;
  isSubmitting: boolean;
}

interface Question {
  id: number;
  text: string;
  chakra: string;
  reverse?: boolean;
}

// Questions for comprehensive chakra assessment
const questions: Question[] = [
  // Root Chakra (Muladhara) - Security, survival, grounding, foundation
  { id: 1, text: "I feel secure and grounded in my daily life.", chakra: "root" },
  { id: 2, text: "I often worry about financial security or basic survival needs.", chakra: "root", reverse: true },
  { id: 3, text: "I feel connected to my body and physical environment.", chakra: "root" },
  { id: 4, text: "I struggle with feelings of anxiety or restlessness without clear cause.", chakra: "root", reverse: true },
  { id: 5, text: "I feel I have a solid foundation in my life and know where I belong.", chakra: "root" },
  
  // Sacral Chakra (Svadhisthana) - Creativity, pleasure, emotion, sexuality
  { id: 6, text: "I can express my emotions freely and appropriately.", chakra: "sacral" },
  { id: 7, text: "I experience guilt or shame around pleasure or creativity.", chakra: "sacral", reverse: true },
  { id: 8, text: "I enjoy sensual experiences and have a healthy relationship with pleasure.", chakra: "sacral" },
  { id: 9, text: "I find it difficult to go with the flow and adapt to change.", chakra: "sacral", reverse: true },
  { id: 10, text: "I can access my creativity easily when needed.", chakra: "sacral" },
  
  // Solar Plexus Chakra (Manipura) - Personal power, confidence, self-esteem
  { id: 11, text: "I feel confident in my abilities and personal power.", chakra: "solarPlexus" },
  { id: 12, text: "I often let others make decisions for me or feel controlled by others.", chakra: "solarPlexus", reverse: true },
  { id: 13, text: "I can set boundaries and stand up for myself effectively.", chakra: "solarPlexus" },
  { id: 14, text: "I struggle with self-doubt or feelings of inadequacy.", chakra: "solarPlexus", reverse: true },
  { id: 15, text: "I have a clear sense of my personal identity and purpose.", chakra: "solarPlexus" },
  
  // Heart Chakra (Anahata) - Love, compassion, empathy, forgiveness
  { id: 16, text: "I can give and receive love with ease.", chakra: "heart" },
  { id: 17, text: "I hold onto past hurts and find it difficult to forgive myself or others.", chakra: "heart", reverse: true },
  { id: 18, text: "I feel compassion for myself and others, even in difficult situations.", chakra: "heart" },
  { id: 19, text: "I experience frequent grief or feelings of isolation from others.", chakra: "heart", reverse: true },
  { id: 20, text: "I nurture my relationships and feel connected to others.", chakra: "heart" },
  
  // Throat Chakra (Vishuddha) - Communication, self-expression, truth
  { id: 21, text: "I express my truth clearly and communicate my needs effectively.", chakra: "throat" },
  { id: 22, text: "I often feel misunderstood or unable to find the right words.", chakra: "throat", reverse: true },
  { id: 23, text: "I listen to others and communicate with authenticity.", chakra: "throat" },
  { id: 24, text: "I frequently hold back from speaking my truth out of fear.", chakra: "throat", reverse: true },
  { id: 25, text: "I feel comfortable sharing my ideas and opinions with others.", chakra: "throat" },
  
  // Third Eye Chakra (Ajna) - Intuition, insight, imagination, perception
  { id: 26, text: "I trust my intuition and inner guidance.", chakra: "thirdEye" },
  { id: 27, text: "I dismiss intuitive insights and rely only on logical reasoning.", chakra: "thirdEye", reverse: true },
  { id: 28, text: "I can visualize outcomes and possibilities with clarity.", chakra: "thirdEye" },
  { id: 29, text: "I have difficulty seeing the bigger picture or different perspectives.", chakra: "thirdEye", reverse: true },
  { id: 30, text: "I am open to insights and understand deeper patterns in my life.", chakra: "thirdEye" },
  
  // Crown Chakra (Sahasrara) - Spiritual connection, consciousness, awareness
  { id: 31, text: "I feel connected to something greater than myself.", chakra: "crown" },
  { id: 32, text: "I feel disconnected from any sense of higher purpose or meaning.", chakra: "crown", reverse: true },
  { id: 33, text: "I experience moments of profound peace or unity consciousness.", chakra: "crown" },
  { id: 34, text: "I am skeptical about spiritual experiences or dismiss their significance.", chakra: "crown", reverse: true },
  { id: 35, text: "I am open to spiritual growth and higher awareness.", chakra: "crown" }
];

export default function OnboardingQuiz({ onComplete, isSubmitting }: OnboardingQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [chakraValues, setChakraValues] = useState<Record<string, number>>({
    root: 5,
    sacral: 5,
    solarPlexus: 5,
    heart: 5,
    throat: 5,
    thirdEye: 5,
    crown: 5
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Handle answer selection
  const handleAnswer = (value: number[]) => {
    const selectedValue = value[0];
    
    // Update answers
    setAnswers({
      ...answers,
      [currentQuestion.id]: selectedValue
    });
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate chakra values and complete
      calculateChakraValues();
    }
  };
  
  // Calculate chakra values from answers
  const calculateChakraValues = () => {
    const chakraTotals: Record<string, { sum: number; count: number }> = {
      root: { sum: 0, count: 0 },
      sacral: { sum: 0, count: 0 },
      solarPlexus: { sum: 0, count: 0 },
      heart: { sum: 0, count: 0 },
      throat: { sum: 0, count: 0 },
      thirdEye: { sum: 0, count: 0 },
      crown: { sum: 0, count: 0 }
    };
    
    // Sum up answers by chakra
    questions.forEach(question => {
      if (answers[question.id] !== undefined) {
        const value = question.reverse ? 11 - answers[question.id] : answers[question.id];
        chakraTotals[question.chakra].sum += value;
        chakraTotals[question.chakra].count++;
      }
    });
    
    // Calculate averages
    const result: Record<string, number> = {};
    Object.entries(chakraTotals).forEach(([chakra, { sum, count }]) => {
      result[chakra] = count > 0 ? Math.round(sum / count) : 5;
    });
    
    setChakraValues(result);
    onComplete(result);
  };
  
  // Go back to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Get chakra color
  const getChakraColor = (chakraKey: string) => {
    const chakra = chakras.find(c => c.key === chakraKey);
    return chakra ? chakra.color : "#888";
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#483D8B]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Start</span>
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Complete</span>
        </div>
      </div>
      
      {/* Question card */}
      <div className="mb-6">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getChakraColor(currentQuestion.chakra) }}
                ></div>
                <div className="text-xs text-neutral-500">
                  {chakras.find(c => c.key === currentQuestion.chakra)?.name} Chakra
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-6">{currentQuestion.text}</h3>
              
              <Slider
                defaultValue={[5]}
                min={1}
                max={10}
                step={1}
                onValueCommit={handleAnswer}
                className="mb-2"
              />
              
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Strongly Disagree</span>
                <span>Neutral</span>
                <span>Strongly Agree</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>
        {currentQuestionIndex === questions.length - 1 && (
          <Button 
            onClick={calculateChakraValues}
            className="bg-[#483D8B] hover:bg-opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Complete Assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}
