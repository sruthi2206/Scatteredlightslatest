/**
 * Helper function to get chakra descriptions
 */
export function getChakraDescription(chakraKey: string, direction: string): string {
    if (chakraKey === 'root') {
        if (direction === 'underactive') {
            return "The Root chakra appears to be underactive.🧠 Mental & Emotional Signs. Persistent anxiety or fear around safety and survival. Low self-worth and chronic insecurity.Feeling disconnected from your body or emotions.Lack of grounding; easily overwhelmed or scattered.       Constant overthinking and restlessness. Difficulty staying present or trusting life.        Fear of abandonment or being unsupported. This may manifest as feelings of instability, anxiety about basic needs, disconnection from the body, or difficulty feeling grounded.  🌱 Root Causes may be Childhood instability, trauma, or unmet basic needs";
        } else if (direction === 'overactive') {
            return 'The Root chakra appears to be overactive. This may manifest as rigidity, materialism, excessive focus on security, or resistance to change.';
        }
        return 'The Root chakra is well-balanced. This suggests a strong foundation of safety, security, and physical wellbeing.';
    }
    else if (chakraKey === 'sacral') {
        if (direction === 'underactive') {
            return 'The Sacral chakra appears to be underactive. 🧠 Mental & Emotional Signs * Suppressed emotions or emotional numbness * Difficulty feeling joy, pleasure, or excitement * Creative blocks or lack of inspiration * Fear of intimacy or vulnerability * Low self-worth related to sensuality or attractiveness * Shame around emotions or sexuality * Disconnection from desires and passions 🌪️ Behavioral Patterns • Avoidance of close relationships * Over-intellectualizing or denying emotions * Difficulty setting boundaries or expressing needs * Lack of playfulness or spontaneity * Feeling undeserving of pleasure or fun * Rigid routines and resistance to flow 🌱 Root Causes * Childhood repression of emotions or affection * Sexual trauma or cultural shame around desire * Lack of emotional validation or warmth * Growing up in emotionally distant environments * Fear of being judged or rejected for being authentic';
        } else if (direction === 'overactive') {
            return 'The Sacral chakra appears to be overactive. This may manifest as emotional volatility, obsessive attachments, addictive behaviors, or boundary issues in relationships.';
        }
        return 'The Sacral chakra is well-balanced. This suggests healthy emotional flow, creative expression, and comfort with pleasure and passion.';
    }
    else if (chakraKey === 'solarPlexus') {
        if (direction === 'underactive') {
            return 'The Solar Plexus chakra appears to be underactive. 🧠 Mental & Emotional Signs * Low confidence or difficulty asserting yourself * Constant self-doubt or feeling powerless * Fear of judgment or failure * Lack of motivation or drive * Feeling invisible, overlooked, or incapable * Difficulty making decisions or trusting your instincts * Over-reliance on others for direction or approval 🌪️ Behavioral Patterns * Avoiding leadership or responsibility * People-pleasing or over-apologizing * Tendency to give up easily when challenged * Difficulty setting personal goals or following through * Feeling stuck in routines or controlled by external systems * Suppressing anger or failing to stand up for yourself 🌱 Root Causes * Strict or very critical parents or elders When the people who raised you were always controlling or finding fault in you. Feeling humiliated, punished, or shamed * When you were made to feel bad, embarrassed, or were punished harshly. Not allowed to make your own choices while growing up * You didn\'t get the freedom to decide things for yourself as a child. Afraid to speak up or say what you want * You held back your opinions or wishes because you were scared of arguments or trouble.Failed many times or were often discouraged * You were told you can\'t do it or had many negative experiences that made you stop trying.';
        } else if (direction === 'overactive') {
            return 'The Solar Plexus chakra appears to be overactive. This may manifest as domineering behavior, excessive control, perfectionism, or anger management issues.';
        }
        return 'The Solar Plexus chakra is well-balanced. This suggests healthy self-confidence, personal power, and the ability to meet challenges effectively.';
    }
    else if (chakraKey === 'heart') {
        if (direction === 'underactive') {
            return 'The Heart chakra appears to be underactive. This may manifest as difficulty giving or receiving love, emotional isolation, resentment, or grief that hasn\'t been processed. Heart Chakra – Root Causes * Lack of love or emotional warmth in childhood * When you didn\'t feel loved, hugged, or emotionally supported as a child. * Loss of someone close (death, breakup, separation) * When someone you loved deeply left or passed away, and it hurt your heart. * Feeling rejected, unloved, or not good enough * When others made you feel like you weren\'t wanted, loved, or accepted for who you are. * Being betrayed or hurt by someone you trusted * When someone you cared about lied, cheated, or broke your trust. * Growing up in a family where love wasn\'t openly shown * When your family didn\'t say "I love you" or didn\'t show affection or care openly. * Holding onto old pain, anger, or sadness * When you keep emotional wounds in your heart and find it hard to forgive or move on.';
        } else if (direction === 'overactive') {
            return 'The Heart chakra appears to be overactive. This may manifest as codependency, emotional overwhelm, poor boundaries in relationships, or possessiveness.';
        }
        return 'The Heart chakra is well-balanced. This suggests the capacity for compassion, healthy relationships, self-love, and emotional openness.';
    }
    else if (chakraKey === 'throat') {
        if (direction === 'underactive') {
            return 'The Throat chakra appears to be underactive. You stay quiet even when you want to speak * You struggle to express your needs or feelings * You let others speak over you or make decisions for you * You may avoid public speaking or fear being in the spotlight * You second-guess your words or feel anxious after speaking * You lie or withhold the truth to keep peace or avoid conflict * You use very few words or talk in a very soft voice * You rarely stand up for yourself even when it\'s needed * You find it hard to be honest with yourself or others.🌱 Root Causes * Being silenced in childhood → When you were told don\'t talk, be quiet, or children should not speak too often. * Fear of being judged or misunderstood → You may have tried speaking up, but people laughed at you or didn\'t understand you. * Growing up in a strict or emotionally closed family → Where open conversations about feelings or opinions were not encouraged. * Punishment or shame for speaking your truth → You were punished for being honest or expressing how you really felt. * Witnessing arguments or shouting in the home → You learned to stay silent to avoid conflict, fights, or tension. * Low self-esteem or lack of self-worth → You don\'t believe your voice matters or that your opinion is valuable.';
        } else if (direction === 'overactive') {
            return 'The Throat chakra appears to be overactive. This may manifest as excessive talking, interrupting others, inability to listen, or being domineering in communication.';
        }
        return 'The Throat chakra is well-balanced. This suggests clear communication, authentic self-expression, and the ability to listen as well as speak your truth.';
    }
    else if (chakraKey === 'thirdEye') {
        if (direction === 'underactive') {
            return 'The Third Eye chakra appears to be underactive. 🧠 Common Behaviors * Difficulty trusting your inner voice or gut feeling. * Often confused or uncertain when making decisions. *Depend too much on others\' opinions. * Struggle to see the "bigger picture" in life. * Not interested in imagination, visualization, or creativity. *Feel stuck in repetitive thoughts or mental fog. * Avoid introspection or spiritual practices.🌱 Root Causes: 1. Taught to ignore your imagination or intuition. → Adults said things like stop daydreaming or that\'s nonsense.2. Being told to always follow logic and facts.→ You were raised to believe only what you see and not what you feel inside.3. Strict upbringing with no spiritual or creative freedom. → You weren\'t allowed to explore deeper questions, spirituality, or creative thinking.4.Mocked or punished for asking deep questions.→ You were shut down when you asked "why" or shared your inner thoughts.5.Living in fear or survival mode→ Too much focus on basic needs or daily problems makes it hard to think beyond.6.Overconsumption of external stimulation → Constant scrolling, TV, or noise can dull inner awareness and imagination.';
        } else if (direction === 'overactive') {
            return 'The Third Eye chakra appears to be overactive. This may manifest as overthinking, spiritual bypassing, detachment from reality, or confusion between intuition and imagination.';
        }
        return 'The Third Eye chakra is well-balanced. This suggests strong intuition, clear perception, imagination grounded in reality, and access to inner wisdom.';
    }
    else if (chakraKey === 'crown') {
        if (direction === 'underactive') {
            return 'The Crown chakra appears to be underactive. 🧠 Common Behaviors: Feeling disconnected from life or yourself. * No interest in spirituality, meditation, or inner growth. * Often feel lost, stuck, or like something\'s missing. * Not feeling part of something greater * Feeling like life has no purpose. * Difficulty trusting life or divine timing. * Relying only on logic; ignoring faith or intuition. * Lacking curiosity about bigger life questions. 🌱 Root Causes : 1.Growing up without spiritual guidance.→ No one talked about deeper questions like "why we exist" or life\'s bigger purpose.2.Feeling unsupported by the universe or life. → Life was hard or painful, and you began to believe that there\'s no higher power or help.3.Being raised in a purely material or logical world → Focus only on money, status, or success with no room for soul, faith, or spiritual connection.4.Experiencing trauma or loss.→ Painful experiences made you feel abandoned by life, God, or your higher self.5.Shutting down spiritual curiosity';
        } else if (direction === 'overactive') {
            return 'The Crown chakra appears to be overactive. This may manifest as spiritual addiction, escapism, disconnection from physical reality, or spiritual superiority.';
        }
        return 'The Crown chakra is well-balanced. This suggests spiritual connection, understanding of one\'s purpose, and the ability to live with awareness of both material and spiritual dimensions.';
    }

    return 'This chakra needs attention and balancing.';
}
