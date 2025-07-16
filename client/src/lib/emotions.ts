// Primary emotions and their properties
export const emotions = [
  {
    name: "Joy",
    description: "A feeling of great pleasure and happiness",
    color: "#FFC107",  // Amber
    relatedEmotions: ["Happiness", "Contentment", "Pleasure", "Excitement", "Gratitude", "Love"],
    chakraConnection: ["heart", "sacral"]
  },
  {
    name: "Sadness",
    description: "Feeling or showing sorrow; unhappy",
    color: "#2196F3",  // Blue
    relatedEmotions: ["Grief", "Disappointment", "Hopelessness", "Loneliness", "Despair"],
    chakraConnection: ["heart", "throat"]
  },
  {
    name: "Fear",
    description: "An unpleasant emotion caused by the threat of danger, pain, or harm",
    color: "#9C27B0",  // Purple
    relatedEmotions: ["Anxiety", "Worry", "Terror", "Dread", "Panic", "Insecurity"],
    chakraConnection: ["root", "solar plexus"]
  },
  {
    name: "Anger",
    description: "A strong feeling of annoyance, displeasure, or hostility",
    color: "#F44336",  // Red
    relatedEmotions: ["Rage", "Frustration", "Irritation", "Resentment", "Bitterness"],
    chakraConnection: ["solar plexus", "sacral"]
  },
  {
    name: "Disgust",
    description: "A feeling of revulsion or strong disapproval aroused by something unpleasant",
    color: "#4CAF50",  // Green
    relatedEmotions: ["Revulsion", "Aversion", "Distaste", "Contempt", "Loathing"],
    chakraConnection: ["sacral", "solar plexus"]
  },
  {
    name: "Surprise",
    description: "A feeling of mild astonishment or shock caused by something unexpected",
    color: "#FFEB3B",  // Yellow
    relatedEmotions: ["Amazement", "Astonishment", "Wonder", "Shock", "Startled"],
    chakraConnection: ["third eye", "throat"]
  },
  {
    name: "Anticipation",
    description: "Expectation or prediction of future events or experiences",
    color: "#FF9800",  // Orange
    relatedEmotions: ["Excitement", "Hope", "Anxiety", "Dread", "Curiosity"],
    chakraConnection: ["sacral", "solar plexus"]
  },
  {
    name: "Trust",
    description: "Firm belief in the reliability, truth, or ability of someone or something",
    color: "#8BC34A",  // Light Green
    relatedEmotions: ["Faith", "Confidence", "Security", "Acceptance", "Openness"],
    chakraConnection: ["heart", "root"]
  },
  {
    name: "Love",
    description: "A deep feeling of affection, attachment, or devotion",
    color: "#E91E63",  // Pink
    relatedEmotions: ["Affection", "Adoration", "Compassion", "Tenderness", "Longing"],
    chakraConnection: ["heart"]
  },
  {
    name: "Peace",
    description: "A state of calm, quiet, tranquility and harmony",
    color: "#00BCD4",  // Cyan
    relatedEmotions: ["Calm", "Tranquility", "Serenity", "Contentment", "Stillness"],
    chakraConnection: ["crown", "heart"]
  },
  {
    name: "Guilt",
    description: "A feeling of responsibility for wrongdoing",
    color: "#607D8B",  // Blue Grey
    relatedEmotions: ["Remorse", "Regret", "Self-blame", "Shame", "Inadequacy"],
    chakraConnection: ["heart", "sacral"]
  },
  {
    name: "Shame",
    description: "A painful feeling of humiliation caused by wrongdoing or foolishness",
    color: "#795548",  // Brown
    relatedEmotions: ["Embarrassment", "Humiliation", "Self-consciousness", "Disgrace"],
    chakraConnection: ["root", "sacral"]
  }
];

// Color mapping for emotions (used for visualization)
export const emotionColors: Record<string, string> = {
  "Joy": "#FFC107",
  "Happiness": "#FFC107",
  "Contentment": "#FFD54F",
  "Excitement": "#FFB300",
  
  "Sadness": "#2196F3",
  "Grief": "#1976D2",
  "Disappointment": "#64B5F6",
  "Loneliness": "#90CAF9",
  
  "Fear": "#9C27B0",
  "Anxiety": "#AB47BC",
  "Worry": "#CE93D8",
  "Panic": "#7B1FA2",
  
  "Anger": "#F44336",
  "Rage": "#D32F2F",
  "Frustration": "#EF5350",
  "Irritation": "#E57373",
  
  "Disgust": "#4CAF50",
  "Contempt": "#388E3C",
  "Loathing": "#66BB6A",
  
  "Surprise": "#FFEB3B",
  "Amazement": "#FDD835",
  "Wonder": "#FFF176",
  
  "Anticipation": "#FF9800",
  "Hope": "#FB8C00",
  "Curiosity": "#FFA726",
  
  "Trust": "#8BC34A",
  "Confidence": "#7CB342",
  "Security": "#9CCC65",
  
  "Love": "#E91E63",
  "Affection": "#D81B60",
  "Compassion": "#EC407A",
  
  "Peace": "#00BCD4",
  "Calm": "#00ACC1",
  "Serenity": "#4DD0E1",
  
  "Guilt": "#607D8B",
  "Remorse": "#546E7A",
  "Regret": "#78909C",
  
  "Shame": "#795548",
  "Embarrassment": "#6D4C41",
  "Humiliation": "#8D6E63"
};

// Emotion wheel structure for visualization
export const emotionWheelStructure = [
  {
    level: 0,
    emotions: ["Joy", "Sadness", "Fear", "Anger", "Disgust", "Surprise"]
  },
  {
    level: 1,
    emotions: [
      "Love", "Contentment", "Anxiety", "Worry",
      "Rage", "Frustration", "Grief", "Loneliness",
      "Trust", "Peace", "Anticipation", "Guilt"
    ]
  },
  {
    level: 2,
    emotions: [
      "Happiness", "Excitement", "Gratitude", "Affection",
      "Panic", "Dread", "Insecurity", "Terror",
      "Irritation", "Disappointment", "Shame", "Regret",
      "Confidence", "Hope", "Calm", "Serenity"
    ]
  }
];
