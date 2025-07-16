import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AnimatedTooltip, 
  AnimatedTooltipContent, 
  AnimatedTooltipTrigger,
  AnimatedTooltipProvider,
  tooltipVariants,
  tooltipThemes 
} from '@/components/ui/animated-tooltip';
import { 
  EmotionTooltip, 
  ChakraTooltip, 
  InteractiveTooltip 
} from '@/components/ui/animated-chart-tooltip';

const TooltipDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState<keyof typeof tooltipVariants>('scale');
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof tooltipThemes>('default');
  
  // Mock data for chart tooltips
  const mockChartData = [
    { name: 'Joy', value: 75, color: '#38b583' },
    { name: 'Peace', value: 65, color: '#0ea5e9' },
    { name: 'Love', value: 45, color: '#ec4899' }
  ];
  
  const mockChakraData = [
    { name: 'Root', value: 7, color: '#FF0000' },
    { name: 'Heart', value: 8.5, color: '#00FF00' },
    { name: 'Crown', value: 6, color: '#A020F0' }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-heading font-bold mb-2 text-center">Animated Tooltip Magic</h1>
      <p className="text-center text-neutral-600 mb-8">
        Playful hover interactions to make your UI delightful
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tooltip Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip Animation Variants</CardTitle>
            <CardDescription>
              Choose different animation styles for tooltips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {Object.keys(tooltipVariants).map((variant) => (
                <AnimatedTooltipProvider key={variant}>
                  <AnimatedTooltip>
                    <AnimatedTooltipTrigger asChild>
                      <Button 
                        variant={selectedVariant === variant ? "default" : "outline"}
                        onClick={() => setSelectedVariant(variant as keyof typeof tooltipVariants)}
                        className="w-full"
                      >
                        {variant}
                      </Button>
                    </AnimatedTooltipTrigger>
                    <AnimatedTooltipContent 
                      variant={variant as keyof typeof tooltipVariants}
                      theme={selectedTheme}
                    >
                      {variant} animation
                    </AnimatedTooltipContent>
                  </AnimatedTooltip>
                </AnimatedTooltipProvider>
              ))}
            </div>
            
            <div className="flex justify-center mt-8 mb-4">
              <AnimatedTooltipProvider>
                <AnimatedTooltip>
                  <AnimatedTooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg cursor-pointer shadow-lg flex items-center justify-center"
                    >
                      <span className="text-xl font-medium">Hover me!</span>
                    </motion.div>
                  </AnimatedTooltipTrigger>
                  <AnimatedTooltipContent 
                    variant={selectedVariant}
                    theme={selectedTheme}
                    className="max-w-[250px]"
                  >
                    <p className="font-medium">Animated Tooltip</p>
                    <p className="text-xs mt-1">Using the {selectedVariant} animation with {selectedTheme} theme.</p>
                  </AnimatedTooltipContent>
                </AnimatedTooltip>
              </AnimatedTooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Tooltip Themes */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip Visual Themes</CardTitle>
            <CardDescription>
              Apply different styles to your tooltips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {Object.keys(tooltipThemes).map((theme) => (
                <AnimatedTooltipProvider key={theme}>
                  <AnimatedTooltip>
                    <AnimatedTooltipTrigger asChild>
                      <Button 
                        variant={selectedTheme === theme ? "default" : "outline"}
                        onClick={() => setSelectedTheme(theme as keyof typeof tooltipThemes)}
                        className="w-full truncate"
                      >
                        {theme}
                      </Button>
                    </AnimatedTooltipTrigger>
                    <AnimatedTooltipContent 
                      variant={selectedVariant}
                      theme={theme as keyof typeof tooltipThemes}
                    >
                      {theme} theme
                    </AnimatedTooltipContent>
                  </AnimatedTooltip>
                </AnimatedTooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart Tooltips */}
        <Card>
          <CardHeader>
            <CardTitle>Specialized Chart Tooltips</CardTitle>
            <CardDescription>
              Enhanced tooltips for data visualizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="emotion">
              <TabsList className="mb-4">
                <TabsTrigger value="emotion">Emotion</TabsTrigger>
                <TabsTrigger value="chakra">Chakra</TabsTrigger>
                <TabsTrigger value="interactive">Interactive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emotion" className="flex justify-center py-4">
                <div className="p-4">
                  <EmotionTooltip 
                    active={true} 
                    payload={mockChartData}
                    label="Apr 28, 2025"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="chakra" className="flex justify-center py-4">
                <div className="p-4">
                  <ChakraTooltip 
                    active={true} 
                    payload={mockChakraData}
                    label="Your Chakra Balance"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="interactive" className="flex justify-center py-4">
                <div className="p-4">
                  <InteractiveTooltip 
                    active={true} 
                    payload={mockChartData}
                    label="Hover over each item"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center text-sm text-muted-foreground mt-6">
              These tooltips are pre-configured for specific chart types
            </div>
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Tooltips</CardTitle>
            <CardDescription>
              Simple guide to using animated tooltips in your app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium">Basic Usage:</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
{`<AnimatedTooltipProvider>
  <AnimatedTooltip>
    <AnimatedTooltipTrigger>
      Hover me
    </AnimatedTooltipTrigger>
    <AnimatedTooltipContent>
      Tooltip content
    </AnimatedTooltipContent>
  </AnimatedTooltip>
</AnimatedTooltipProvider>`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Specialized Chart Tooltips:</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
{`<Tooltip
  content={({ active, payload, label }) => 
    <EmotionTooltip 
      active={active} 
      payload={payload} 
      label={label} 
    />
  }
/>`}
              </pre>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">
                💡 Pro Tip: Combine with <code className="text-xs bg-white px-1 py-0.5 rounded">motion.div</code> from Framer Motion for even more interactive elements.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TooltipDemo;