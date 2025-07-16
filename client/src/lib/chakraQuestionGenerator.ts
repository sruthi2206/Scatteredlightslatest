// This file contains utilities for dynamically generating chakra assessment questions

import { chakras } from "./chakras";

// Valid chakra keys
export type ChakraKey =
  | "root"
  | "sacral"
  | "solarPlexus"
  | "heart"
  | "throat"
  | "thirdEye"
  | "crown"
  | "all";

// Question category types
export type QuestionCategory =
  | "mind"
  | "emotional"
  | "physical"
  | "situational"
  | "reflection";

// Define the structure of a chakra assessment question
export interface ChakraQuestion {
  id: string;
  text: string;
  chakra: ChakraKey;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Define the structure of a response option
export interface QuestionOption {
  value: string;
  label: string;
  description: string;
}

// Template type with proper category
interface QuestionTemplate {
  template: string;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Common question templates for each chakra
const questionTemplates: Partial<Record<ChakraKey, QuestionTemplate[]>> = {
  root: [
    {
      template:
        "How often do you feel financially secure and stable?   (Imagine you suddenly lose your job or main income source. Would you still feel calm and trust that you’ll manage your basic needs like food, rent, and bills?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How easily do you adjust to unexpected changes in your routine? (If your daily schedule suddenly changed — like your task got doubled or people arrived in home for you to host — how stressed or calm would you feel? Do you adapt easily or feel anxious?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How often do you feel physically safe and secure in your environment? (When you're at home or walking outside, do you feel relaxed and safe in your surroundings — or do you feel alert, anxious, or guarded?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How comfortable would you feel if you had to completely relocate to a new area? (If life asked you to move to a new city or country, how secure and grounded would you feel during that transition? Would it feel exciting, or would it shake your sense of stability?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How confident do you feel about your ability to meet your basic needs? (Think about your food, shelter, and daily expenses — do you trust yourself to always find a way to provide for these, even during tough times?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  sacral: [
    {
      template:
        "How comfortable are you expressing your emotions to others? (When you feel sad, angry, or excited — can you share these feelings openly with someone you trust, or do you usually hold them inside?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How often do you engage in creative activities that bring you joy? (Do you ever lose track of time doing something creative like dancing, painting, writing, or cooking — just for fun? How often do you let yourself enjoy that kind of play?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How connected do you feel to your body's needs and desires?  (Can you tell when your body needs rest, touch, movement, or certain foods? Do you listen and respond to those signals, or ignore them often?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How comfortable would you feel trying a completely new form of creative expression? (If someone invited you to join a dance class, write a poem, or try painting for the first time — would you feel excited, nervous, or completely blocked?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How balanced is your approach to work and pleasure in your life? (Do you allow yourself time to enjoy life, laugh, and relax — or do you feel guilty when you're not being productive or working?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  solarPlexus: [
    {
      template:
        "How confident do you feel when making important decisions? (When you have to make a big choice — like changing jobs or ending a relationship — do you trust your judgment, or often doubt yourself and seek others’ approval?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How comfortable are you with asserting your needs and boundaries? (If someone crosses a line or asks too much of you, can you confidently say “no” or speak up for yourself — or do you usually stay quiet to avoid conflict?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How often do you feel energized and motivated to achieve your goals? (When you think about your goals or dreams, do you feel a fire inside to move toward them — or do you often feel tired, stuck, or unsure where to start?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How comfortable would you feel taking a leadership role in a group project? (If your team needed someone to step up and lead — whether it’s planning an event or managing a task — would you feel confident guiding the group, or nervous about being in charge?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How empowered do you feel in directing the course of your life? (Do you feel like you're the one steering your life — making choices that match your truth — or do you often feel like life is just happening to you or someone else is taking decisions for your life?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  heart: [
    {
      template:
        "How easily can you forgive others who have hurt you? (Think of someone who hurt you in the past — have you been able to forgive them and let go of the pain, or do you still feel the wound in your heart?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How comfortable are you receiving love and care from others? (When someone compliments you, offers to help, or shows care—do you receive it openly, or do you feel awkward, unworthy, or push it away?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How often do you practice self-compassion when you make mistakes? (When you mess up or do some mistake, do you speak to yourself with kindness—like you would to a dear friend—or do you beat yourself up harshly or do negative self talk like you are good for nothing, you won't get better and so on?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How comfortable would you feel supporting a friend through an emotional crisis? (If a close friend came to you crying or deeply upset, would you feel emotionally strong and present to comfort them, or would you feel lost or doesn't know how to react to such situations?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How balanced is your ability to give and receive love in relationships? (In your relationships, do you find it easy to love and care for others—but also to let them love and care for you? Or is it only one sided easier than the other?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  throat: [
    {
      template:
        "How comfortable are you speaking your truth, even when it might be unpopular? (If everyone in a room had a different opinion than you, could you still calmly share what you truly believe—or would you stay silent to avoid judgment?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How well do you communicate your needs and boundaries to others? (When someone crosses a line or asks too much of you, can you clearly express what you need—without guilt or fear? Or do you often say “yes” when you mean “no”?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How easily can you express yourself through writing, speaking, or other forms? (Do you find it easy to put your thoughts into words—whether you’re talking, journaling, or being creative—or do you often feel blocked or unsure how to express yourself?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How comfortable would you feel giving a presentation to a large group? (If you were asked to speak in front of a room full of people about something important to you—would you feel confident and clear, or nervous and unsure of your voice?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How authentic do you feel your self-expression is in daily life? (When you talk or act in daily life, does it truly feel like you—or do you often hide parts of yourself just to fit in or be accepted?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  thirdEye: [
    {
      template:
        "How often do you trust your intuition when making decisions? (When you get a gut feeling or inner nudge about something—do you follow it, or do you ignore it and choose only what seems logical?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How easily can you visualize future possibilities and outcomes? (Close your eyes and think about where you want to be in 1 year. Can you see a clear picture in your mind—or is it blank or foggy?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How often do you notice subtle patterns and connections in your life? (Do you ever see signs, patterns, or coincidences that seem meaningful—or do you mostly think everything is just random?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How confident would you feel solving a complex problem with limited information? (Imagine you’re faced with a tricky problem and don’t have all the facts—can you still trust your inner wisdom to find a way forward, or do you freeze without certainty?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How clear is your vision for your future and life purpose?(If someone asked, “What’s your purpose in life?” — would you have a clear answer, or would it feel confusing or empty?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
  crown: [
    {
      template:
        "How connected do you feel to something greater than yourself? (Do you ever feel like there’s a higher power, divine energy, or deeper intelligence guiding your life—or does life feel random and disconnected?)",
      inverseScoring: false,
      category: "mind",
    },
    {
      template:
        "How often do you experience a sense of peace and transcendence? (Do you ever have moments—during nature walks, prayer, music, or stillness—where you feel calm, peaceful, or connected to something beyond this world?)",
      inverseScoring: false,
      category: "emotional",
    },
    {
      template:
        "How interested are you in exploring spiritual or philosophical questions? (Do you enjoy thinking about the big questions like “Why are we here?” or “What happens after death?”—or do those topics feel uncomfortable or boring?)",
      inverseScoring: false,
      category: "physical",
    },
    {
      template:
        "How would you respond to a conversation about life's deeper meaning and purpose? (If someone started talking to you about soul journeys, higher purpose, or the meaning of life—would you be curious and open, or feel awkward and want to change the subject?)",
      inverseScoring: false,
      category: "situational",
    },
    {
      template:
        "How integrated do you feel your spiritual beliefs are with your daily actions? (Do your daily choices—how you speak, work, love, and live—reflect your spiritual values, or do they feel separate from what you believe deep inside? or do you practice virtues and values of spiritual being in day to day life?)",
      inverseScoring: false,
      category: "reflection",
    },
  ],
};

// Inverse question templates
const inverseQuestionTemplates: Partial<Record<ChakraKey, QuestionTemplate[]>> =
  {
    root: [
      {
        template:
          "How often do you feel anxious about financial security? (Do you often worry about not having enough money for rent, food, or your future? Even when things are okay, does a part of you still feel unsafe or insecure?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How easily do you become destabilized by unexpected changes? (If your plans suddenly change—like an event is canceled or a new job task appears—do you feel overwhelmed or sad emotionally or resisting the situaion?)",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template:
          "How frequently do you feel physically unsafe in your environment? (Do you feel nervous walking alone, anxious at home, or constantly alert as if something might go wrong physically?)",
        inverseScoring: true,
        category: "physical",
      },
    ],
    sacral: [
      {
        template:
          "How difficult is it for you to express your emotions freely? (When you're feeling sad, happy, angry, or excited—do you struggle to show or speak about it? Do you often bottle it up inside?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How often do you feel disconnected from joy and pleasure? (Do you go through your day without feeling much enjoyment? Do fun, playful, or creative activities feel distant or meaningless?)",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template: "How frequently do you ignore your body's signals and needs? (Do you notice when your body is trying to tell you something—like you're tired, stressed, or in pain—but still keep pushing through?)",
        inverseScoring: true,
        category: "physical",
      },
    ],
    solarPlexus: [
      {
        template: "How often do you doubt your abilities and decisions? (When you make a choice, do you feel unsure or worry if it was the right one? Do you often think others are more capable or smarter than you?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How difficult is it for you to assert your needs and boundaries? (If someone treats you unfairly or asks too much—do you struggle to say “no” or speak up for yourself, even if you’re uncomfortable?)",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template:
          "How frequently do you feel powerless in situations? (Do you often feel like you have no control over what happens in your life or relationships—as if others make decisions for you?)",
        inverseScoring: true,
        category: "physical",
      },
    ],
    heart: [
      {
        template:
          "How difficult is it for you to open up emotionally to others? (Do you find it hard to share your true feelings—even with close friends or family? Are you afraid of being judged or misunderstood?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How often do you hold grudges against those who have hurt you? (When someone wrongs you, do you carry that pain or anger for a long time? Is it hard for you to forgive, even after a while?)",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template: "How frequently do you criticize yourself harshly? (Do you often speak to yourself in a negative or cruel way when you make mistakes—calling yourself names or saying you’re not good enough?)",
        inverseScoring: true,
        category: "physical",
      },
    ],
    throat: [
      {
        template:
          "How often do you hold back from expressing your true thoughts? (Do you silence your real opinion just to keep the peace or avoid judgment, even when something really matters to you?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template: "How difficult is it for you to speak up in group settings? (When you're in a meeting or social group, do you feel nervous about speaking—even if you have something to say?)",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template: "How frequently do others misunderstand your communication? ",
        inverseScoring: true,
        category: "physical",
      },
    ],
    thirdEye: [
      {
        template: "How often do you doubt your intuition and inner guidance? (When your gut tells you something, do you tend to ignore it or brush it off as “just a feeling”? Do you only trust logic?)",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How difficult is it for you to see multiple perspectives on an issue?If you disagree with someone, can you still understand where they’re coming from—or do you feel stuck in your own view?",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template:
          "How frequently do you overlook patterns and synchronicities? (Do you miss the little signs, repeating events, or meaningful coincidences that life shows you—or not believe they matter?)",
        inverseScoring: true,
        category: "physical",
      },
    ],
    crown: [
      {
        template:
          "How often do you feel disconnected from any higher purpose? Do you feel like you’re just going through the motions in life—without a deeper reason, passion, or sense of direction?",
        inverseScoring: true,
        category: "mind",
      },
      {
        template:
          "How difficult is it for you to find meaning in challenging situations? When tough times happen, do they feel totally pointless and painful—or can you find some deeper understanding or lesson in them?",
        inverseScoring: true,
        category: "emotional",
      },
      {
        template:
          "How frequently do you feel a sense of isolation from the world? Do you often feel like you’re alone in this world, even in a crowd? Like no one truly understands or connects with your soul?",
        inverseScoring: true,
        category: "physical",
      },
    ],
  };

// Reflection question that includes chakra property
interface ReflectionQuestion {
  template: string;
  chakra: ChakraKey;
  inverseScoring: boolean;
  category: QuestionCategory;
}

// Additional reflection questions that apply to all chakras
const reflectionQuestions: ReflectionQuestion[] = [
  {
    template:
      "How balanced do you feel overall in your physical and material needs? (Do you feel stable in life with things like a steady income, a safe place to live, enough food, and regular sleep? Or do you often feel like you're just trying to survive, always stressed about money or safety?)",
    chakra: "root",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template:
      "How would you rate your overall emotional and creative wellbeing? (Do you feel exciting doing some creative stuffs? it might be cooking something creative or any task in a creative way or Do you feel borded or exhausted?)",
    chakra: "sacral",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template:
      "How empowered do you feel in your life choices and personal authority?",
    chakra: "solarPlexus",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template:
      "How fulfilled do you feel in your relationships and capacity to give/receive love? (Do you feel emotionally close and connected with people in your life (friends, family, partner) Or do you feel distant, blocked, or scared when it comes to love and emotional connection?)",
    chakra: "heart",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template:
      "How authentic do you feel in expressing yourself and your truth to the world? (Can you share your honest thoughts, feelings, or ideas without fear? Or do you sometimes hide parts of yourself to fit in or avoid being judged?)",
    chakra: "throat",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template: "How clear do you feel about your life purpose and direction? (If someone asked you about your life purpose whould you able to see and communicate it articulatly? and are you making steady progress towards it in daily life?)",
    chakra: "thirdEye",
    inverseScoring: false,
    category: "reflection",
  },
  {
    template:
      "How connected do you feel to a sense of meaning and spiritual wholeness? (Do you feel connected to something greater—like the universe, do you have faith on something greater than you Or do you often feel lost, empty, or unsure about why you're here?)",
    chakra: "crown",
    inverseScoring: false,
    category: "reflection",
  },
];

// Generate a set of questions for each step of the assessment
export function generateQuestions(): ChakraQuestion[][] {
  const steps: ChakraQuestion[][] = [[], [], [], [], []];

  // Helper function to convert string to ChakraKey safely
  const toChakraKey = (key: string): ChakraKey => {
    if (
      key === "root" ||
      key === "sacral" ||
      key === "solarPlexus" ||
      key === "heart" ||
      key === "throat" ||
      key === "thirdEye" ||
      key === "crown" ||
      key === "all"
    ) {
      return key;
    }
    return "root"; // fallback
  };

  // Step 1: Mind Level Questions (Root, Sacral, Solar Plexus)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const mindQuestions = templates.filter((q) => q.category === "mind");
    const question = mindQuestions[0]; // Take first mind question for each chakra

    if (question) {
      steps[0].push({
        id: `${chakraKey}_mind_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category,
      });
    }

    // Add some inverse questions for variety
    if (inverseQuestionTemplates[chakraKey]) {
      const inverseQuestion = inverseQuestionTemplates[chakraKey].find(
        (q) => q.category === "mind",
      );
      if (inverseQuestion) {
        steps[0].push({
          id: `${chakraKey}_mind_inverse_1`,
          text: inverseQuestion.template,
          chakra: chakraKey,
          inverseScoring: inverseQuestion.inverseScoring,
          category: inverseQuestion.category,
        });
      }
    }
  });

  // Step 2: Emotional Level Questions (Heart, Throat)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const emotionalQuestions = templates.filter(
      (q) => q.category === "emotional",
    );
    const question = emotionalQuestions[0]; // Take first emotional question for each chakra

    if (question) {
      steps[1].push({
        id: `${chakraKey}_emotional_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category,
      });
    }

    // Add some inverse questions for variety
    if (inverseQuestionTemplates[chakraKey]) {
      const inverseQuestion = inverseQuestionTemplates[chakraKey].find(
        (q) => q.category === "emotional",
      );
      if (inverseQuestion) {
        steps[1].push({
          id: `${chakraKey}_emotional_inverse_1`,
          text: inverseQuestion.template,
          chakra: chakraKey,
          inverseScoring: inverseQuestion.inverseScoring,
          category: inverseQuestion.category,
        });
      }
    }
  });

  // Step 3: Physical Level Questions (All chakras)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const physicalQuestions = templates.filter(
      (q) => q.category === "physical",
    );
    const question = physicalQuestions[0]; // Take first physical question for each chakra

    if (question) {
      steps[2].push({
        id: `${chakraKey}_physical_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category,
      });
    }
  });

  // Step 4: Situational Questions (All chakras)
  Object.entries(questionTemplates).forEach(([chakraKeyStr, templates]) => {
    const chakraKey = toChakraKey(chakraKeyStr);
    const situationalQuestions = templates.filter(
      (q) => q.category === "situational",
    );
    const question = situationalQuestions[0]; // Take first situational question for each chakra

    if (question) {
      steps[3].push({
        id: `${chakraKey}_situational_1`,
        text: question.template,
        chakra: chakraKey,
        inverseScoring: question.inverseScoring,
        category: question.category,
      });
    }
  });

  // Step 5: Reflection Questions (All chakras)
  reflectionQuestions.forEach((question, index) => {
    steps[4].push({
      id: `reflection_${index + 1}`,
      text: question.template,
      chakra: question.chakra,
      inverseScoring: question.inverseScoring,
      category: question.category,
    });
  });

  return steps;
}

// Get appropriate response options based on question type and content
export function getOptionsForQuestion(
  question: ChakraQuestion,
): QuestionOption[] {
  // For situational questions
  if (question.category === "situational") {
    return [
      {
        value: "1",
        label: "Very uncomfortable",
        description: "I would avoid this completely",
      },
      {
        value: "2",
        label: "Somewhat uncomfortable",
        description: "I would feel anxious but try",
      },
      {
        value: "3",
        label: "Neutral",
        description: "I could manage this situation",
      },
      {
        value: "4",
        label: "Somewhat comfortable",
        description: "I would feel at ease",
      },
      {
        value: "5",
        label: "Very comfortable",
        description: "I would thrive in this situation",
      },
    ];
  }

  // For reflection questions
  if (question.category === "reflection") {
    return [
      {
        value: "1",
        label: "Not at all",
        description: "This is a significant challenge for me",
      },
      {
        value: "2",
        label: "Slightly",
        description: "I struggle with this frequently",
      },
      {
        value: "3",
        label: "Moderately",
        description: "I have mixed success with this",
      },
      {
        value: "4",
        label: "Considerably",
        description: "I do this well most of the time",
      },
      {
        value: "5",
        label: "Completely",
        description: "This is a consistent strength of mine",
      },
    ];
  }

  // Define question-specific options for emotional awareness questions
  const questionSpecificOptions: Record<string, QuestionOption[]> = {
    // Root chakra emotional questions
    root_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I'm completely thrown off by unexpected changes",
      },
      {
        value: "2",
        label: "Rarely",
        description: "Small changes make me feel quite unstable",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I can adapt to some changes with effort",
      },
      {
        value: "4",
        label: "Often",
        description: "I generally adapt well to most changes",
      },
      {
        value: "5",
        label: "Always",
        description: "I embrace change as an opportunity for growth",
      },
    ],
    root_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I stay grounded even during major life changes",
      },
      {
        value: "2",
        label: "Rarely",
        description: "Only extreme disruptions destabilize me",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I'm occasionally thrown off by unexpected changes",
      },
      {
        value: "4",
        label: "Often",
        description: "Many types of change make me feel unsettled",
      },
      {
        value: "5",
        label: "Always",
        description: "Even minor changes can completely destabilize me",
      },
    ],

    // Sacral chakra emotional questions
    sacral_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I don't make time for creative activities",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I occasionally find brief moments for creativity",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I periodically engage in creative activities",
      },
      {
        value: "4",
        label: "Often",
        description: "I regularly make time for creative expression",
      },
      {
        value: "5",
        label: "Always",
        description: "Creativity is integrated into my daily routine",
      },
    ],
    sacral_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I consistently feel connected to joy and pleasure",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I generally maintain my connection to enjoyment",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I periodically feel disconnected from joy",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently struggle to experience pleasure",
      },
      {
        value: "5",
        label: "Always",
        description: "I feel completely cut off from joy and pleasure",
      },
    ],

    // Solar plexus emotional questions
    solarPlexus_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I struggle to assert any boundaries at all",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I only assert boundaries in extreme situations",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I can assert boundaries with select people",
      },
      {
        value: "4",
        label: "Often",
        description: "I'm generally comfortable setting boundaries",
      },
      {
        value: "5",
        label: "Always",
        description: "I confidently express my needs and limits",
      },
    ],
    solarPlexus_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I always feel empowered to express my needs",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I typically find it easy to assert boundaries",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I occasionally struggle with setting limits",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently find it challenging to speak up",
      },
      {
        value: "5",
        label: "Always",
        description: "I feel completely unable to assert my needs",
      },
    ],

    // Heart chakra emotional questions
    heart_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I find it impossible to receive love from others",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I'm usually uncomfortable receiving care",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I can accept love from certain people",
      },
      {
        value: "4",
        label: "Often",
        description: "I'm generally open to receiving love",
      },
      {
        value: "5",
        label: "Always",
        description: "I fully embrace love and care offered to me",
      },
    ],
    heart_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I forgive easily and don't hold grudges",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I generally let go of past hurts quickly",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I occasionally hold onto certain grudges",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently struggle to forgive others",
      },
      {
        value: "5",
        label: "Always",
        description: "I find it impossible to forgive and move on",
      },
    ],

    // Throat chakra emotional questions
    throat_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I cannot communicate my needs at all",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I struggle significantly with expressing needs",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I can communicate some needs to certain people",
      },
      {
        value: "4",
        label: "Often",
        description: "I usually express my needs clearly",
      },
      {
        value: "5",
        label: "Always",
        description: "I communicate my boundaries confidently",
      },
    ],
    throat_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I always speak confidently in groups",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I'm usually comfortable speaking up",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I occasionally hesitate in group settings",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently find it hard to speak in groups",
      },
      {
        value: "5",
        label: "Always",
        description: "I'm completely unable to speak up in groups",
      },
    ],

    // Third eye chakra emotional questions
    thirdEye_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I cannot visualize potential outcomes at all",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I struggle to see future possibilities",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I can visualize some potential outcomes",
      },
      {
        value: "4",
        label: "Often",
        description: "I can usually imagine different possibilities",
      },
      {
        value: "5",
        label: "Always",
        description: "I clearly visualize multiple future scenarios",
      },
    ],
    thirdEye_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I always see all sides of every situation",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I generally consider multiple perspectives",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I occasionally miss alternative viewpoints",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently struggle with other perspectives",
      },
      {
        value: "5",
        label: "Always",
        description: "I'm completely stuck in one perspective",
      },
    ],

    // Crown chakra emotional questions
    crown_emotional_1: [
      {
        value: "1",
        label: "Never",
        description: "I never experience moments of inner peace",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I occasionally feel brief moments of peace",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I periodically experience tranquility",
      },
      {
        value: "4",
        label: "Often",
        description: "I regularly experience peace and transcendence",
      },
      {
        value: "5",
        label: "Always",
        description: "I frequently access profound states of peace",
      },
    ],
    crown_emotional_inverse_1: [
      {
        value: "1",
        label: "Never",
        description: "I always find meaning in difficult situations",
      },
      {
        value: "2",
        label: "Rarely",
        description: "I generally discover purpose in challenges",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "I occasionally struggle to find meaning",
      },
      {
        value: "4",
        label: "Often",
        description: "I frequently find it hard to see purpose",
      },
      {
        value: "5",
        label: "Always",
        description: "I cannot find any meaning in hardship",
      },
    ],
  };

  // For emotional questions, use specific options when available
  if (
    question.category === "emotional" &&
    questionSpecificOptions[question.id]
  ) {
    return questionSpecificOptions[question.id];
  }

  // For mind questions, check if we have specific options, otherwise use generic
  if (question.id.includes("mind")) {
    const mindOptions = questionSpecificOptions[question.id];
    if (mindOptions) return mindOptions;
  }

  // For physical questions
  if (question.category === "physical") {
    if (question.inverseScoring) {
      return [
        {
          value: "1",
          label: "Never",
          description: "I never experience this physical challenge",
        },
        {
          value: "2",
          label: "Rarely",
          description: "I occasionally notice this issue",
        },
        {
          value: "3",
          label: "Sometimes",
          description: "I periodically experience this",
        },
        {
          value: "4",
          label: "Often",
          description: "I frequently feel this way physically",
        },
        {
          value: "5",
          label: "Always",
          description: "I constantly experience this physical state",
        },
      ];
    } else {
      return [
        {
          value: "1",
          label: "Never",
          description: "I never experience this physical state",
        },
        {
          value: "2",
          label: "Rarely",
          description: "I occasionally feel this way",
        },
        {
          value: "3",
          label: "Sometimes",
          description: "I periodically experience this",
        },
        {
          value: "4",
          label: "Often",
          description: "I frequently have this physical experience",
        },
        {
          value: "5",
          label: "Always",
          description: "I consistently maintain this physical state",
        },
      ];
    }
  }

  // Default options for any other mind, emotional questions
  if (question.inverseScoring) {
    return [
      {
        value: "1",
        label: "Never",
        description: "I don't experience this at all",
      },
      {
        value: "2",
        label: "Rarely",
        description: "This happens in exceptional circumstances",
      },
      {
        value: "3",
        label: "Sometimes",
        description: "This occurs occasionally in my life",
      },
      {
        value: "4",
        label: "Often",
        description: "This happens in many situations",
      },
      {
        value: "5",
        label: "Always",
        description: "This is consistently true for me",
      },
    ];
  } else {
    return [
      {
        value: "1",
        label: "Never",
        description: "This doesn't occur in my experience",
      },
      { value: "2", label: "Rarely", description: "This happens infrequently" },
      {
        value: "3",
        label: "Sometimes",
        description: "This occurs in some situations",
      },
      {
        value: "4",
        label: "Often",
        description: "This is true in many circumstances",
      },
      {
        value: "5",
        label: "Always",
        description: "This is consistently part of my experience",
      },
    ];
  }
}

// Get step title based on step index
export function getStepTitle(step: number): string {
  switch (step) {
    case 0:
      return "Mind Level Assessment";
    case 1:
      return "Emotional Awareness";
    case 2:
      return "Physical Experience";
    case 3:
      return "Situational Response";
    case 4:
      return "Reflection & Integration";
    default:
      return "Chakra Assessment";
  }
}

// Get step description based on step index
export function getStepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Explore your mental patterns and thought processes";
    case 1:
      return "Assess your emotional responses and feelings";
    case 2:
      return "Evaluate your physical sensations and experiences";
    case 3:
      return "Examine how you respond to specific situations";
    case 4:
      return "Integrate insights from all dimensions of experience";
    default:
      return "Discover your chakra energy patterns";
  }
}
