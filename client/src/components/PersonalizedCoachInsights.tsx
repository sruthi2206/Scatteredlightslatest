import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Heart, Calendar, TrendingUp, Target, Star } from "lucide-react";

// Force React preamble detection
const ReactElement = React.createElement;

interface PersonalizedInsightsProps {
  coachType: string;
  userJourneyData: {
    daysActive: number;
    consistencyScore: number;
    achievements: string[];
    growthAreas: string[];
  };
  recentEmotions: string[];
  chakraInsights?: {
    primaryImbalance: string;
    strongestChakra: string;
    overallBalance: number;
  };
  sessionCount: number;
}

const PersonalizedCoachInsights: React.FC<PersonalizedInsightsProps> = ({ 
  coachType, 
  userJourneyData, 
  recentEmotions, 
  chakraInsights,
  sessionCount 
}) => {
  
  const getCoachTypeColor = (type: string) => {
    const colors = {
      inner_child: "bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-200",
      shadow_self: "bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200", 
      higher_self: "bg-gradient-to-br from-violet-100 to-purple-100 border-violet-200",
      integration: "bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-200"
    };
    return colors[type as keyof typeof colors] || colors.integration;
  };

  const getInsightsByCoachType = (type: string) => {
    switch (type) {
      case 'inner_child':
        return {
          focus: "Emotional healing and self-compassion",
          keyMetric: "Inner peace cultivation",
          suggestion: recentEmotions.includes('processing challenges') 
            ? "Your inner child needs gentle nurturing right now"
            : "You're building a beautiful connection with your authentic self"
        };
      case 'shadow_self':
        return {
          focus: "Shadow integration and unconscious patterns",
          keyMetric: "Shadow work depth",
          suggestion: sessionCount > 3
            ? "You're courageously exploring deeper shadow aspects"
            : "Beginning shadow work takes tremendous bravery"
        };
      case 'higher_self':
        return {
          focus: "Spiritual connection and life purpose",
          keyMetric: "Higher wisdom access",
          suggestion: chakraInsights?.overallBalance && chakraInsights.overallBalance > 70
            ? "Your chakras support strong spiritual connection"
            : "Chakra balancing will enhance your spiritual practices"
        };
      case 'integration':
        return {
          focus: "Practical application of insights",
          keyMetric: "Implementation consistency",
          suggestion: userJourneyData.consistencyScore > 70
            ? "Your consistency is creating lasting transformation"
            : "Small daily practices will accelerate your growth"
        };
      default:
        return {
          focus: "Personal growth and healing",
          keyMetric: "Overall progress",
          suggestion: "You're on a meaningful journey of self-discovery"
        };
    }
  };

  const insights = getInsightsByCoachType(coachType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Journey Overview */}
      <Card className={`${getCoachTypeColor(coachType)} shadow-sm`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Your Journey Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Days Active</span>
            <Badge variant="secondary">{userJourneyData.daysActive} days</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Consistency</span>
              <span className="text-sm font-medium">{userJourneyData.consistencyScore}%</span>
            </div>
            <Progress value={userJourneyData.consistencyScore} className="h-2" />
          </div>

          <div className="pt-2">
            <p className="text-xs text-neutral-600 italic">{insights.suggestion}</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {userJourneyData.achievements.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-green-800">
              <Star className="w-4 h-4 mr-2" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {userJourneyData.achievements.map((achievement, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chakra Insights */}
      {chakraInsights && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-violet-800">
              <Heart className="w-4 h-4 mr-2" />
              Energy Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">Overall Balance</span>
              <span className="text-xs font-medium">{chakraInsights.overallBalance}%</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-600">Strongest:</span>
                <span className="font-medium">{chakraInsights.strongestChakra}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Growth Area:</span>
                <span className="font-medium">{chakraInsights.primaryImbalance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emotional State */}
      {recentEmotions.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-amber-800">
              <TrendingUp className="w-4 h-4 mr-2" />
              Current Energy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {recentEmotions.map((emotion, index) => (
                <Badge key={index} className="bg-amber-100 text-amber-800 text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Focus */}
      {userJourneyData.growthAreas.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-blue-800">
              <Target className="w-4 h-4 mr-2" />
              Growth Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {userJourneyData.growthAreas.slice(0, 2).map((area, index) => (
                <div key={index} className="text-xs text-blue-700">
                  • {area}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Insights */}
      <Card className="border-neutral-200 bg-gradient-to-br from-neutral-50 to-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm font-medium text-neutral-700">
            <User className="w-4 h-4 mr-2" />
            Session Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-600">Previous Sessions</span>
            <Badge variant="outline" className="text-xs">{sessionCount}</Badge>
          </div>
          
          <div className="text-xs text-neutral-600">
            <span className="font-medium">Focus:</span> {insights.focus}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonalizedCoachInsights;