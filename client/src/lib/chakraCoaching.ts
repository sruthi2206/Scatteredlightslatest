import { chakras } from "./chakras";

/**
 * Determines which chakra needs the most attention based on assessment results
 * @param chakraValues Chakra assessment results
 * @returns Object containing focus information
 */
export function determineFocusChakra(chakraValues: Record<string, number>) {
  // Calculate how far each chakra is from the balanced state (5)
  const imbalances = Object.entries(chakraValues).map(([key, value]) => {
    const distanceFromBalance = Math.abs(value - 5);
    const direction = value < 5 ? "underactive" : value > 5 ? "overactive" : "balanced";
    return { key, value, distanceFromBalance, direction };
  });

  // Sort by most imbalanced
  const sortedImbalances = [...imbalances].sort((a, b) => b.distanceFromBalance - a.distanceFromBalance);
  
  // Get the most imbalanced chakra
  const primaryFocus = sortedImbalances[0];
  
  // Get the chakra details
  const chakraInfo = chakras.find(c => c.key === primaryFocus.key);
  
  if (!chakraInfo) {
    return {
      key: primaryFocus.key,
      name: primaryFocus.key,
      direction: primaryFocus.direction,
      value: primaryFocus.value,
      description: "This chakra needs attention."
    };
  }
  
  return {
    key: primaryFocus.key,
    name: chakraInfo.name,
    sanskritName: chakraInfo.sanskritName,
    direction: primaryFocus.direction,
    value: primaryFocus.value,
    description: primaryFocus.direction === "underactive" 
      ? `Your ${chakraInfo.name} chakra appears to be underactive. This may manifest as ${chakraInfo.underactiveSymptoms.join(", ")}.`
      : primaryFocus.direction === "overactive"
        ? `Your ${chakraInfo.name} chakra appears to be overactive. This may manifest as ${chakraInfo.overactiveSymptoms.join(", ")}.`
        : `Your ${chakraInfo.name} chakra is well-balanced. You're exhibiting traits such as ${chakraInfo.balancedTraits.join(", ")}.`,
    healingPractices: chakraInfo.healingPractices.slice(0, 3)
  };
}

/**
 * Maps chakra assessment to appropriate coach recommendations
 * @param chakraValues Chakra assessment results
 * @returns Object with coaching recommendations
 */
export function getCoachRecommendations(chakraValues: Record<string, number>) {
  const focusChakra = determineFocusChakra(chakraValues);
  
  // Maps chakras to the most relevant coach
  const coachTypeByChakra: Record<string, string> = {
    root: "inner_child",
    sacral: "inner_child",
    solarPlexus: "shadow_self",
    heart: "shadow_self",
    throat: "higher_self",
    thirdEye: "higher_self",
    crown: "higher_self"
  };
  
  // Get recommended coach type
  const recommendedCoach = coachTypeByChakra[focusChakra.key] || "integration";

  // Generate coaching focus questions based on the chakra imbalance
  const coachingFocusQuestions: Record<string, string[]> = {
    inner_child: [
      "What early memories do you have related to feeling safe and secure?",
      "How does your current sense of safety affect your daily life?",
      "What childhood patterns might be affecting your relationship with your body and physical needs?",
      "In what ways do you nurture your creative expression and sensuality?",
      "What would help you feel more grounded and present in your everyday experience?"
    ],
    shadow_self: [
      "What aspects of yourself do you find difficult to accept or acknowledge?",
      "How comfortable are you with expressing and setting boundaries?",
      "In what situations do you find yourself feeling powerless or overly controlling?",
      "What emotions do you find most difficult to express or experience?",
      "How do you respond to criticism or rejection from others?"
    ],
    higher_self: [
      "What does authentic self-expression mean to you?",
      "How do you distinguish between your intuition and your fears?",
      "What is your relationship with the concept of purpose or meaning?",
      "How do you connect with your deeper wisdom or spiritual nature?",
      "What practices help you access your inner guidance system?"
    ],
    integration: [
      "How might you integrate the insights from your chakra assessment into daily practice?",
      "What small, sustainable changes could support your overall energy balance?",
      "How would addressing your chakra imbalances change your day-to-day experience?",
      "What support systems might help you maintain new practices for chakra healing?",
      "What would a more balanced version of yourself look and feel like?"
    ]
  };
  
  return {
    focusChakra,
    recommendedCoach,
    coachingFocus: coachingFocusQuestions[recommendedCoach] || coachingFocusQuestions.integration,
    generalRecommendation: `Based on your chakra assessment, working with the ${
      recommendedCoach === "inner_child" ? "Inner Child Coach" :
      recommendedCoach === "shadow_self" ? "Shadow Self Coach" :
      recommendedCoach === "higher_self" ? "Higher Self Coach" : 
      "Integration Coach"
    } would be most beneficial for addressing your ${focusChakra.name} chakra imbalance.`
  };
}

/**
 * Prepares chakra assessment data to be included in a coaching session
 * @param chakraValues Chakra assessment results
 * @returns String to include in AI coaching prompt
 */
export function prepareChakraCoachingContext(chakraValues: Record<string, number>): string {
  const recommendations = getCoachRecommendations(chakraValues);
  
  const chakraSummary = Object.entries(chakraValues)
    .map(([key, value]) => {
      const chakraInfo = chakras.find(c => c.key === key);
      const name = chakraInfo ? chakraInfo.name : key;
      const status = value < 4 ? "underactive" : value > 6 ? "overactive" : "balanced";
      return `${name}: ${value}/10 (${status})`;
    })
    .join("\n");
  
  return `
CHAKRA ASSESSMENT CONTEXT:
Overall Profile:
${chakraSummary}

Primary Focus: ${recommendations.focusChakra.name} Chakra (${recommendations.focusChakra.value}/10, ${recommendations.focusChakra.direction})
${recommendations.focusChakra.description}

Recommended healing practices:
${recommendations.focusChakra.healingPractices?.join("\n") || "No specific recommendations available"}

Coaching considerations:
- This user would benefit from focusing on their ${recommendations.focusChakra.name} chakra.
- The imbalance indicates possible issues with ${
    recommendations.focusChakra.key === "root" ? "security, stability, and groundedness" :
    recommendations.focusChakra.key === "sacral" ? "creativity, emotions, and pleasure" :
    recommendations.focusChakra.key === "solarPlexus" ? "personal power, confidence, and self-esteem" :
    recommendations.focusChakra.key === "heart" ? "love, compassion, and relationships" :
    recommendations.focusChakra.key === "throat" ? "communication, expression, and truth" :
    recommendations.focusChakra.key === "thirdEye" ? "intuition, insight, and perception" :
    "spirituality, purpose, and connection"
  }.
`;
}