import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ArrowLeft, Download, Lightbulb, Music, Moon, Sun, Wind, Heart, AlertCircle, Brain } from "lucide-react";
import { chakras, getChakraStatus } from "@/lib/chakras";
import ChakraWheel from "@/components/ChakraWheel";

// Default chakra values for visualization
const defaultChakraValues = {
  crown: 5,
  thirdEye: 5,
  throat: 5,
  heart: 5,
  solarPlexus: 5,
  sacral: 5,
  root: 5
};

export default function ChakraInformation() {
  const [, setLocation] = useLocation();
  
  // Helper function to get icon for each chakra
  const getChakraIcon = (chakraKey: string) => {
    switch(chakraKey) {
      case 'crown':
        return <Brain className="w-6 h-6" />;
      case 'thirdEye':
        return <AlertCircle className="w-6 h-6" />;
      case 'throat':
        return <Wind className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'solarPlexus':
        return <Sun className="w-6 h-6" />;
      case 'sacral':
        return <Moon className="w-6 h-6" />;
      case 'root':
        return <Lightbulb className="w-6 h-6" />;
      default:
        return <Sun className="w-6 h-6" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/chakra-report')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chakra Report
        </Button>
        
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
            Understanding the Chakra System
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Learn about the energy centers in your body and their impact on your physical, emotional, and spiritual wellbeing
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>The Chakra Wheel</CardTitle>
                <CardDescription>
                  A visual representation of the seven main chakras
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ChakraWheel 
                  size={250} 
                  animated={true} 
                  values={defaultChakraValues}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>What are Chakras?</CardTitle>
                <CardDescription>
                  The ancient energy system and its significance in modern wellness
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Chakras are the energy centers in your body that regulate the flow of life force energy (prana or chi). The word "chakra" comes from Sanskrit and means "wheel" or "disk," referring to the spinning wheels of energy throughout your body.
                </p>
                
                <p>
                  There are seven main chakras, from the base of your spine to the crown of your head. When these energy centers are balanced and aligned, you experience optimal physical, emotional, and spiritual wellbeing. However, when chakras become blocked or imbalanced, it can lead to various physical, emotional, and mental health issues.
                </p>
                
                <p>
                  Each chakra corresponds to specific glands, organs, and nerves, as well as to psychological, emotional, and spiritual states of being. Understanding your chakra system can provide insights into areas of your life that need attention and healing.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
                  <Button 
                    onClick={() => window.scrollTo({top: document.getElementById('chakra-details')?.offsetTop, behavior: 'smooth'})}
                    className="bg-[#483D8B] hover:bg-opacity-90"
                  >
                    Explore Each Chakra
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.scrollTo({top: document.getElementById('chakra-healing')?.offsetTop, behavior: 'smooth'})}
                  >
                    Chakra Healing Practices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Chakra Details Section */}
        <div id="chakra-details" className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">The Seven Main Chakras</h2>
          
          <Accordion type="single" collapsible className="w-full">
            {chakras.map((chakra) => (
              <AccordionItem 
                key={chakra.key} 
                value={chakra.key}
                className="border rounded-lg mb-4 overflow-hidden"
                style={{ borderLeftWidth: '4px', borderLeftColor: chakra.color }}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white"
                      style={{ backgroundColor: chakra.color }}
                    >
                      {getChakraIcon(chakra.key)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-lg">{chakra.name}</h3>
                      <p className="text-sm text-neutral-500">{chakra.sanskritName} • {chakra.location}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-neutral-700 mb-4">{chakra.description}</p>
                      
                      <h4 className="font-semibold mb-2">Element & Color</h4>
                      <p className="text-neutral-700 mb-4">
                        Element: <span className="font-medium">{chakra.element}</span> • 
                        Color: <span 
                          className="font-medium" 
                          style={{ color: chakra.color }}
                        >
                          {chakra.color === "#9370DB" ? "Violet" : 
                           chakra.color === "#483D8B" ? "Indigo" : 
                           chakra.color === "#1E90FF" ? "Blue" : 
                           chakra.color === "#3CB371" ? "Green" : 
                           chakra.color === "#FFD700" ? "Yellow" : 
                           chakra.color === "#FF7F50" ? "Orange" : 
                           chakra.color === "#DC143C" ? "Red" : ""}
                        </span>
                      </p>
                      
                      <h4 className="font-semibold mb-2">When Balanced</h4>
                      <p className="text-neutral-700 mb-4">{chakra.balancedState}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Signs of Imbalance</h4>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-1">Underactive (Blocked)</h5>
                        <p className="text-neutral-700">
                          {chakra.underactiveSymptoms.join(", ")}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-1">Overactive</h5>
                        <p className="text-neutral-700">
                          {chakra.overactiveSymptoms.join(", ")}
                        </p>
                      </div>
                      
                      <h4 className="font-semibold mb-2">Associations</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Physical</h5>
                          <div className="flex flex-wrap gap-1">
                            {chakra.physicalAssociations.map((item, index) => (
                              <span key={index} className="bg-neutral-100 px-2 py-1 rounded-full text-xs">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Psychological</h5>
                          <div className="flex flex-wrap gap-1">
                            {chakra.psychologicalAssociations.map((item, index) => (
                              <span key={index} className="bg-neutral-100 px-2 py-1 rounded-full text-xs">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        {/* Chakra Healing Section */}
        <div id="chakra-healing" className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Chakra Healing Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Sun className="w-6 h-6 mr-2 text-amber-500" />
                  <CardTitle>Meditation</CardTitle>
                </div>
                <CardDescription>
                  Focus your awareness on each chakra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 mb-4">
                  Meditation is one of the most effective ways to balance and align your chakras. By focusing your attention on each energy center, you can sense blockages and encourage energy to flow freely.
                </p>
                <h4 className="font-semibold mb-2">Simple Chakra Meditation:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Sit in a comfortable position with your spine straight</li>
                  <li>Take several deep breaths to center yourself</li>
                  <li>Beginning at the root chakra, focus your attention on each energy center</li>
                  <li>Visualize each chakra spinning and glowing in its respective color</li>
                  <li>If you sense any blockages, imagine them dissolving</li>
                  <li>Continue up through all seven chakras</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Music className="w-6 h-6 mr-2 text-purple-500" />
                  <CardTitle>Sound Therapy</CardTitle>
                </div>
                <CardDescription>
                  Use sounds and mantras to vibrate and balance chakras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 mb-4">
                  Each chakra resonates with a specific frequency. Sound therapy uses these frequencies in the form of singing bowls, tuning forks, or specific mantras to bring harmony to your energy centers.
                </p>
                <h4 className="font-semibold mb-2">Chakra Seed Mantras:</h4>
                <ul className="space-y-2">
                  <li><strong>Root (LAM):</strong> Pronounced "lum"</li>
                  <li><strong>Sacral (VAM):</strong> Pronounced "vum"</li>
                  <li><strong>Solar Plexus (RAM):</strong> Pronounced "rum"</li>
                  <li><strong>Heart (YAM):</strong> Pronounced "yum"</li>
                  <li><strong>Throat (HAM):</strong> Pronounced "hum"</li>
                  <li><strong>Third Eye (AUM):</strong> Pronounced "om"</li>
                  <li><strong>Crown (OM):</strong> Pronounced "om"</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Wind className="w-6 h-6 mr-2 text-blue-500" />
                  <CardTitle>Yoga Practice</CardTitle>
                </div>
                <CardDescription>
                  Specific poses to stimulate and balance each chakra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 mb-4">
                  Yoga asanas (postures) can directly influence the flow of energy through your chakras. Different poses target specific energy centers to remove blockages and restore balance.
                </p>
                <h4 className="font-semibold mb-2">Yoga Poses for Each Chakra:</h4>
                <ul className="space-y-2">
                  <li><strong>Root:</strong> Mountain Pose, Warrior I</li>
                  <li><strong>Sacral:</strong> Goddess Pose, Butterfly</li>
                  <li><strong>Solar Plexus:</strong> Boat Pose, Warrior III</li>
                  <li><strong>Heart:</strong> Camel Pose, Cobra Pose</li>
                  <li><strong>Throat:</strong> Fish Pose, Shoulder Stand</li>
                  <li><strong>Third Eye:</strong> Child's Pose, Eagle Pose</li>
                  <li><strong>Crown:</strong> Headstand, Lotus Pose</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Resources Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Continue Your Chakra Journey</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-3">Further Resources</h3>
                  <p className="text-neutral-700 mb-4">
                    Explore these resources to deepen your understanding of chakras and energy healing:
                  </p>
                  <ul className="space-y-2">
                    <li>• <strong>Books:</strong> "Wheels of Life" by Anodea Judith, "Eastern Body, Western Mind" by Anodea Judith</li>
                    <li>• <strong>Practices:</strong> Regular meditation, yoga, sound therapy, color therapy</li>
                    <li>• <strong>Tools:</strong> Crystals, essential oils, chakra candles, healing music</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-3">Next Steps</h3>
                  <p className="text-neutral-700 mb-4">
                    Based on your chakra assessment, focus on balancing the energy centers that need attention. Consider these approaches:
                  </p>
                  <ul className="space-y-2">
                    <li>• Review your personal chakra report</li>
                    <li>• Schedule regular time for chakra-balancing practices</li>
                    <li>• Track changes in your energy system over time</li>
                    <li>• Consult with an energy healer for personalized guidance</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button 
                  onClick={() => setLocation('/chakra-report')}
                  className="bg-[#483D8B] hover:bg-opacity-90"
                >
                  Return to Your Chakra Report
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}