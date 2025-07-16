import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, ArrowLeft, MessageCircle } from "lucide-react";
import { chakras, getChakraStatus, getOverallChakraBalance, getChakraRecommendations } from "@/lib/chakras";
import { getCoachRecommendations } from "@/lib/chakraCoaching";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export default function ChakraReport() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Reference to the report container
  const reportRef = useRef<HTMLDivElement>(null);

  // Function to generate and download PDF report
  const generatePdfReport = async () => {
    setLoadingPdf(true);

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set up the PDF document
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // mm
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, align: 'left' | 'center' | 'right' = 'left', isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        if (align === 'center') {
          x = pageWidth / 2;
        } else if (align === 'right') {
          x = pageWidth - margin;
        }
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        return y + (lines.length * fontSize * 0.352) + 2; // 0.352 is an approximation for line height
      };
      
      // Add a new page with correct positioning
      const addPage = () => {
        pdf.addPage();
        yPosition = margin;
      };
      
      // Check if we need to add a new page
      const checkForNewPage = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > pageHeight - margin) {
          addPage();
          return true;
        }
        return false;
      };

      // Header
      pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
      yPosition = addWrappedText('SCATTERED LIGHTS CHAKRA ASSESSMENT REPORT', margin, yPosition, pageWidth - margin * 2, 20, 'center', true);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 5;
      yPosition = addWrappedText(`Generated for: ${user?.username || 'User'}`, margin, yPosition, pageWidth - margin * 2, 12, 'center');
      yPosition = addWrappedText(`Date: ${formatDate(new Date())}`, margin, yPosition, pageWidth - margin * 2, 12, 'center');
      yPosition += 10;
      
      // Overall Balance
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
      yPosition = addWrappedText("OVERALL CHAKRA BALANCE", margin, yPosition, pageWidth - margin * 2, 16, 'center', true);
      yPosition += 5;
      
      pdf.setTextColor(0, 0, 0);
      yPosition = addWrappedText(`Current Balance Level: ${overallBalance.status}`, margin, yPosition, pageWidth - margin * 2, 12, 'left', true);
      yPosition = addWrappedText(`Balance Score: ${overallBalance.score}/10`, margin, yPosition, pageWidth - margin * 2);
      yPosition += 5;
      
      yPosition = addWrappedText(overallBalance.description, margin, yPosition, pageWidth - margin * 2);
      yPosition += 10;
      
      // Individual Chakra Analysis
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
      yPosition = addWrappedText("INDIVIDUAL CHAKRA ANALYSIS", margin, yPosition, pageWidth - margin * 2, 16, 'center', true);
      yPosition += 10;
      
      // Add each chakra detail
      chakras.forEach(chakra => {
        const key = chakra.key as ChakraKey;
        const value = chakraValues[key];
        const status = getChakraStatus(value, key);
        
        // Check if we need to add a new page for this chakra section
        checkForNewPage(60);
        
        // Draw a colored square with the chakra color
        pdf.setFillColor(chakra.color);
        pdf.rect(margin, yPosition, 5, 5, 'F');
        
        // Chakra name and status
        pdf.setTextColor(0, 0, 0);
        yPosition = addWrappedText(`${chakra.name.toUpperCase()} (${chakra.sanskritName})`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 14, 'left', true);
        
        // Convert the chakra.color (hex) to RGB for the text color
        const hex = chakra.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        pdf.setTextColor(r, g, b);
        
        yPosition = addWrappedText(`Current Level: ${value}/10 - ${status.status}`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 12);
        
        pdf.setTextColor(0, 0, 0);
        yPosition = addWrappedText(status.description, margin + 10, yPosition, pageWidth - margin * 2 - 10);
        
        // Add detailed analysis for all users who have access to chakra assessment
        if (status.detailedAnalysis) {
          yPosition += 5;
          
          // Behavioral Patterns
          pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
          yPosition = addWrappedText("Behavioral Patterns:", margin + 10, yPosition, pageWidth - margin * 2 - 10, 11, 'left', true);
          pdf.setTextColor(0, 0, 0);
          
          status.detailedAnalysis.behavioralPatterns.forEach((pattern, index) => {
            if (index < 3) { // Limit to 3 patterns for PDF report
              checkForNewPage(20);
              yPosition = addWrappedText(`• ${pattern}`, margin + 15, yPosition, pageWidth - margin * 2 - 15, 10);
            }
          });
          
          yPosition += 5;
          
          // Daily Life Impacts
          pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
          yPosition = addWrappedText("Daily Life Impacts:", margin + 10, yPosition, pageWidth - margin * 2 - 10, 11, 'left', true);
          pdf.setTextColor(0, 0, 0);
          
          status.detailedAnalysis.dailyLifeImpacts.forEach((impact, index) => {
            if (index < 3) { // Limit to 3 impacts for PDF report
              checkForNewPage(20);
              yPosition = addWrappedText(`• ${impact}`, margin + 15, yPosition, pageWidth - margin * 2 - 15, 10);
            }
          });
          
          yPosition += 5;
          
          // Personalized Recommendations
          pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
          yPosition = addWrappedText("Personalized Recommendations:", margin + 10, yPosition, pageWidth - margin * 2 - 10, 11, 'left', true);
          pdf.setTextColor(0, 0, 0);
          
          status.detailedAnalysis.personalizedRecommendations.forEach((recommendation, index) => {
            if (index < 3) { // Limit to 3 recommendations for PDF report
              checkForNewPage(20);
              yPosition = addWrappedText(`• ${recommendation}`, margin + 15, yPosition, pageWidth - margin * 2 - 15, 10);
            }
          });
        }
        yPosition += 10;
      });
      
      // Check if we need a new page for recommendations
      checkForNewPage(40);
      
      // Personalized Recommendations
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
      yPosition = addWrappedText("PERSONALIZED CHAKRA HEALING RECOMMENDATIONS", margin, yPosition, pageWidth - margin * 2, 16, 'center', true);
      yPosition += 10;
      
      // Add each recommendation
      Object.entries(recommendations).forEach(([chakraKey, recs]) => {
        const chakraInfo = chakras.find(c => c.key === chakraKey);
        
        // Check if we need a new page for this recommendation section
        checkForNewPage(30);
        
        // Draw a colored square with the chakra color
        if (chakraInfo) {
          pdf.setFillColor(chakraInfo.color);
          pdf.rect(margin, yPosition, 5, 5, 'F');
        }
        
        // Chakra name
        pdf.setTextColor(0, 0, 0);
        yPosition = addWrappedText(`For ${chakraInfo?.name || chakraKey} Chakra:`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 14, 'left', true);
        
        // Recommendations
        if (Array.isArray(recs)) {
          recs.forEach((rec, i) => {
            // Check if we need a new page for this recommendation
            checkForNewPage(15);
            yPosition = addWrappedText(`${i + 1}. ${rec}`, margin + 10, yPosition, pageWidth - margin * 2 - 10);
            yPosition += 5;
          });
        } else {
          yPosition = addWrappedText(String(recs || ''), margin + 10, yPosition, pageWidth - margin * 2 - 10);
        }
        
        yPosition += 5;
      });
      
      // Check if we need a new page for coaching recommendations
      checkForNewPage(40);
      
      // AI Coaching Recommendations
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      pdf.setTextColor(72, 61, 139); // #483D8B (indigo)
      yPosition = addWrappedText("AI COACHING RECOMMENDATIONS", margin, yPosition, pageWidth - margin * 2, 16, 'center', true);
      yPosition += 10;
      
      // Add coaching recommendation
      pdf.setTextColor(0, 0, 0);
      yPosition = addWrappedText(coachingRecommendations.generalRecommendation, margin, yPosition, pageWidth - margin * 2);
      yPosition += 10;
      
      // Add focus chakra information
      yPosition = addWrappedText(`Focus Chakra: ${coachingRecommendations.focusChakra.name}`, margin, yPosition, pageWidth - margin * 2, 12, 'left', true);
      yPosition = addWrappedText(`Current Level: ${coachingRecommendations.focusChakra.value}/10 - ${coachingRecommendations.focusChakra.direction}`, margin, yPosition, pageWidth - margin * 2);
      yPosition += 5;
      
      yPosition = addWrappedText(coachingRecommendations.focusChakra.description, margin, yPosition, pageWidth - margin * 2);
      yPosition += 10;
      
      // Add coaching focus questions
      yPosition = addWrappedText("Suggested Reflection Questions:", margin, yPosition, pageWidth - margin * 2, 12, 'left', true);
      yPosition += 5;
      
      // Add each coaching focus question
      if (Array.isArray(coachingRecommendations.coachingFocus)) {
        coachingRecommendations.coachingFocus.forEach((question: string, i: number) => {
          // Check if we need a new page for this question
          checkForNewPage(20);
          
          pdf.setTextColor(0, 0, 0);
          yPosition = addWrappedText(`${i + 1}. ${question}`, margin, yPosition, pageWidth - margin * 2);
          yPosition += 5;
        });
      }
      
      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(`Page ${i} of ${pageCount} | © Scattered Lights ${new Date().getFullYear()}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {
          align: 'center'
        });
      }
      
      // Save the PDF
      pdf.save(`ScatteredLights-ChakraReport-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Your chakra report has been downloaded as a PDF file.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast({
        title: "Error Generating Report",
        description: "There was a problem creating your PDF report. Please try again.",
        variant: "destructive",
      });
      
      // Fall back to text report if PDF fails
      generateTextReport();
    } finally {
      setLoadingPdf(false);
    }
  };

  // Fetch user's chakra profile
  const { data: chakraProfile, isLoading: isLoadingChakraProfile } = useQuery({
    queryKey: ['/api/users', user?.id, 'chakra-profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/chakra-profile`);
        if (!res.ok) {
          if (res.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch chakra profile');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching chakra profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch user's chakra assessment history (we'll use journal entries as a proxy for now)
  const { data: journalEntries } = useQuery({
    queryKey: ['/api/users', user?.id, 'journal-entries'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await fetch(`/api/users/${user.id}/journal-entries`);
        if (!res.ok) {
          if (res.status === 404) {
            return [];
          }
          throw new Error('Failed to fetch journal entries');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Check if profile is just a default one with all chakras set to 5
  const isDefaultProfile = (profile: any) => {
    return profile && 
      profile.crownChakra === 5 && 
      profile.thirdEyeChakra === 5 && 
      profile.throatChakra === 5 && 
      profile.heartChakra === 5 && 
      profile.solarPlexusChakra === 5 && 
      profile.sacralChakra === 5 && 
      profile.rootChakra === 5;
  };
  
  // Check if user has genuinely completed an assessment
  const hasCompletedAssessment = chakraProfile !== null && 
                               chakraProfile !== undefined && 
                               !isDefaultProfile(chakraProfile);
                               
  // If user hasn't completed an assessment, consider chakraProfile as null
  const validChakraProfile = hasCompletedAssessment ? chakraProfile : null;
  
  // Prepare chakra values from the profile, only if they've completed an assessment
  const chakraValues = validChakraProfile ? {
    crown: validChakraProfile.crownChakra,
    thirdEye: validChakraProfile.thirdEyeChakra,
    throat: validChakraProfile.throatChakra,
    heart: validChakraProfile.heartChakra,
    solarPlexus: validChakraProfile.solarPlexusChakra,
    sacral: validChakraProfile.sacralChakra,
    root: validChakraProfile.rootChakra
  } : {
    crown: 0,
    thirdEye: 0,
    throat: 0,
    heart: 0,
    solarPlexus: 0,
    sacral: 0,
    root: 0
  };

  type ChakraKey = keyof typeof chakraValues;

  // Get overall chakra balance assessment
  const overallBalance = getOverallChakraBalance(chakraValues);

  // Get personalized recommendations
  const recommendations = getChakraRecommendations(chakraValues);

  // Get coach recommendations based on chakra assessment
  const coachingRecommendations = getCoachRecommendations(chakraValues);

  // Create a function to generate text-based report as fallback
  const generateTextReport = () => {
    setLoadingPdf(true);

    setTimeout(() => {
      // Create a simple text report
      const reportText = `
# SCATTERED LIGHTS CHAKRA ASSESSMENT REPORT
Generated for: ${user?.name || 'User'}
Date: ${formatDate(new Date())}

## OVERALL CHAKRA BALANCE
Current Balance Level: ${overallBalance.status}
Balance Score: ${overallBalance.score}/10

${overallBalance.description}

## INDIVIDUAL CHAKRA ANALYSIS

${chakras.map(chakra => {
  const key = chakra.key as ChakraKey;
  const status = getChakraStatus(chakraValues[key]);
  return `
### ${chakra.name.toUpperCase()} (${chakra.sanskritName})
Current Level: ${chakraValues[key]}/10 - ${status.status}

${status.description}
`;
}).join('\n')}

## PERSONALIZED CHAKRA HEALING RECOMMENDATIONS

${Object.entries(recommendations).map(([chakra, recs]) => {
  const chakraInfo = chakras.find(c => c.key === chakra);
  return `
### For ${chakraInfo?.name || chakra} Chakra:
${Array.isArray(recs) ? recs.join('\n') : String(recs || '')}
`;
}).join('\n')}

This report was generated by Scattered Lights' AI-powered chakra assessment system.

© Scattered Lights ${new Date().getFullYear()}
      `;

      // Create a blob and download link
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chakra-report-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your detailed chakra assessment report has been downloaded.",
      });

      setLoadingPdf(false);
    }, 2000);
  };

  if (!user) {
    return null;
  }

  if (isLoadingChakraProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-[#483D8B] animate-spin"></div>
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">No Assessment Completed</h2>
              <p className="text-neutral-600 mb-6">
                You need to complete your first chakra assessment before viewing a report.
                {isDefaultProfile(chakraProfile) && " The system detected you haven't genuinely completed an assessment yet."}
              </p>
              <Button onClick={() => setLocation('/chakra-assessment')} className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg">
                Start Your First Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* PDF capture element */}
        <div ref={reportRef}>
          <motion.div
            className="text-center mb-8 chakra-report-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
              Your Chakra Assessment Report
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Generated on {formatDate(new Date())}
            </p>
            <p className="text-neutral-600 max-w-xl mx-auto mt-2">
              <span className="font-semibold">Last Assessment Date:</span> {formatDate(new Date(chakraProfile.updatedAt))}
            </p>
            <Separator className="my-6 max-w-md mx-auto" />
          </motion.div>

          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 chakra-report-section">
            <h2 className="text-2xl font-semibold mb-4 text-center">Overview</h2>
            <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-5 rounded-lg mb-6">
              <h3 className="text-xl font-medium mb-3 text-center">Overall Chakra Balance</h3>
              <div className="grid place-items-center mb-4">
                <div className="relative w-32 h-32 rounded-full bg-white shadow-inner flex items-center justify-center flex-col">
                  <div className="absolute inset-2 rounded-full border-4 border-[#483D8B] border-opacity-20"></div>
                  <div className="text-4xl font-bold text-[#483D8B]">{overallBalance.score}</div>
                  <div className="text-xs text-gray-500">out of 10</div>
                </div>
              </div>
              <p className="text-center font-medium text-lg mb-2 text-[#483D8B]">{overallBalance.status}</p>
              <p className="text-center text-neutral-600">{overallBalance.description}</p>
            </div>

            <div>
              {(() => {
                // Check if all chakras are balanced (within range 5-7)
                const allValues = Object.values(chakraValues);
                const allBalanced = allValues.every(val => val >= 5 && val <= 7);
                const allEqual = allValues.every(val => val === allValues[0]);
                
                if (allBalanced && allEqual) {
                  // Show balanced state message
                  return (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500">
                        ✓
                      </div>
                      <h3 className="text-xl font-semibold text-green-700 mb-2">Beautifully Balanced</h3>
                      <p className="text-green-600 mb-3">
                        All your chakras are in harmony! Your energy centers are working together beautifully.
                      </p>
                      <p className="text-neutral-600 text-sm">
                        Continue with your current practices to maintain this wonderful balance.
                      </p>
                    </div>
                  );
                }
                
                // Show strongest and needs attention when not all balanced
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <h3 className="text-lg font-medium mb-3 text-center">Strongest Energy</h3>
                      {(() => {
                        // Find the chakra with the highest value
                     const entries = Object.entries(chakraValues) as [keyof typeof chakraValues, number][];

                      // Sort by value descending to get the highest first
                      const sortedByHighest = entries.sort((a, b) => b[1] - a[1]);
                      const [strongestChakra, highestValue] = sortedByHighest[0];
                        
                        const chakraInfo = chakras.find(c => c.key === strongestChakra);
                        return (
                          <div className="text-center">
                            <div 
                              className="w-20 h-20 mx-auto rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold"
                              style={{ backgroundColor: chakraInfo?.color }}
                            >
                              {highestValue}
                            </div>
                            <p className="text-xl font-semibold" style={{ color: chakraInfo?.color }}>{chakraInfo?.name}</p>
                            <p className="text-sm text-neutral-600">{chakraInfo?.sanskritName}</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <h3 className="text-lg font-medium mb-3 text-center">Needs Attention</h3>
                      {(() => {
                        // Find the chakra with the lowest value
                    const entries = Object.entries(chakraValues) as [keyof typeof chakraValues, number][];

                    // Sort by value ascending to get the lowest first
                    const sortedByLowest = entries.sort((a, b) => a[1] - b[1]);
                    const [needsAttentionChakra, lowestValue] = sortedByLowest[0];
                        
                        const chakraInfo = chakras.find(c => c.key === needsAttentionChakra);
                        return (
                          <div className="text-center">
                            <div  
                              className="w-20 h-20 mx-auto rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold"
                              style={{ backgroundColor: chakraInfo?.color }}
                            >
                              {lowestValue}
                            </div>
                            <p className="text-xl font-semibold" style={{ color: chakraInfo?.color }}>{chakraInfo?.name}</p>
                            <p className="text-sm text-neutral-600">{chakraInfo?.sanskritName}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button 
                className="bg-[#483D8B] hover:bg-[#3D3276]"
                onClick={generatePdfReport} 
                disabled={loadingPdf}
              >
                {loadingPdf ? (
                  <>
                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download as PDF
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/chakra-assessment')}
              >
                Update Assessment
              </Button>
            </div>
          </div>

          {/* Tabs for detailed information */}
          <div className="mb-8">
            <Tabs defaultValue="chakras">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="chakras">Chakra Details</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
              </TabsList>

              <TabsContent value="chakras" className="space-y-6">
                {chakras.map(chakra => {
                  const key = chakra.key as ChakraKey;
                  const status = getChakraStatus(chakraValues[key], chakra.key);
                  return (
                    <Card key={chakra.key}>
                      <CardHeader className="pb-3 border-l-4" style={{ borderColor: chakra.color }}>
                        <CardTitle className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-3"
                            style={{ backgroundColor: chakra.color }}
                          ></div>
                          {chakra.name} ({chakra.sanskritName})
                        </CardTitle>
                        <CardDescription>
                          Current Status: <span className="font-medium">{status.status}</span> - Value: {Number(chakraValues[key]).toFixed(1)}/10
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-neutral-700 mb-3">
                          {status.description && status.description.includes('🧠') ? (
                            <div className="whitespace-pre-line">{status.description}</div>
                          ) : (
                            <p>{status.description}</p>
                          )}
                        </div>
                        <p className="text-neutral-700 mb-3">{chakra.detailedDescription}</p>
                        
                        {/* Detailed Analysis Section - visible to all users with chakra assessment access */}
                        {status.detailedAnalysis && (
                          <div className="mt-4 bg-gradient-to-r from-slate-50 to-neutral-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="text-lg font-medium mb-3 text-indigo-800">Detailed Analysis</h4>
                            
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-semibold mb-2 text-neutral-800">Behavioral Patterns You May Experience:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-700 text-sm">
                                  {status.detailedAnalysis.behavioralPatterns.map((pattern, index) => (
                                    <li key={index}>{pattern}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold mb-2 text-neutral-800">How This Affects Your Daily Life:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-700 text-sm">
                                  {status.detailedAnalysis.dailyLifeImpacts.map((impact, index) => (
                                    <li key={index}>{impact}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold mb-2 text-neutral-800">Potential Root Causes:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-700 text-sm">
                                  {status.detailedAnalysis.rootCauses.map((cause, index) => (
                                    <li key={index}>{cause}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold mb-2 text-neutral-800">Personalized Healing Recommendations:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-700 text-sm">
                                  {status.detailedAnalysis.personalizedRecommendations.map((recommendation, index) => (
                                    <li key={index}>{recommendation}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                          <h4 className="text-lg font-medium mb-2">Current Status: <span className="font-semibold">{status.status}</span></h4>

                          {status.level === "balanced" ? (
                            <div className="mb-3">
                              <p className="font-medium text-green-600 mb-2">Balanced State</p>
                              <p className="text-neutral-700">{chakra.balancedState}</p>
                              <div className="mt-3">
                                <h5 className="text-sm font-semibold mb-1">Balanced Traits:</h5>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {Array.isArray(chakra.balancedTraits) && 
                                    chakra.balancedTraits.map((trait, index) => (
                                      <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {trait}
                                      </span>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                          ) : status.level === "underactive" ? (
                            <div className="mb-3">
                              <p className="font-medium text-amber-600 mb-2">Underactive State</p>
                              <p className="text-neutral-700 mb-3">This chakra has reduced energy flow, which may be causing various challenges in your life.</p>
                              <div className="mb-3">
                                <h5 className="text-sm font-semibold mb-1">Common Symptoms:</h5>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {Array.isArray(chakra.underactiveSymptoms) && 
                                    chakra.underactiveSymptoms.map((symptom, index) => (
                                      <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                        {symptom}
                                      </span>
                                    ))
                                  }
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-amber-200">
                                <h5 className="text-sm font-semibold mb-1">Balancing Practices:</h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {chakra.healingPractices.slice(0, 5).map((practice, index) => (
                                    <li key={index}>{practice}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Detailed analysis for chakra */}
                              {(
                                <div className="mt-6 bg-gradient-to-r from-amber-50 to-neutral-50 p-4 rounded-lg border border-amber-100">
                                  <div className="flex items-center mb-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center mr-2">
                                      <span className="text-amber-700 text-xs">D</span>
                                    </div>
                                    <h5 className="text-amber-800 font-medium">Detailed Analysis</h5>
                                  </div>
                                  
                                  {(() => {
                                    // Get detailed status with chakra key
                                    const detailedStatus = getChakraStatus(chakraValues[key], chakra.key);
                                    
                                    if (detailedStatus.detailedAnalysis) {
                                      return (
                                        <div className="space-y-4 text-sm">
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Behavioral Patterns You May Experience:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.behavioralPatterns.map((pattern, index) => (
                                                <li key={index}>{pattern}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">How This Affects Your Daily Life:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.dailyLifeImpacts.map((impact, index) => (
                                                <li key={index}>{impact}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Potential Root Causes:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.rootCauses.map((cause, index) => (
                                                <li key={index}>{cause}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Personalized Healing Recommendations:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.personalizedRecommendations.map((recommendation, index) => (
                                                <li key={index}>{recommendation}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    return null;
                                  })()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mb-3">
                              <p className="font-medium text-red-600 mb-2">Overactive State</p>
                              <p className="text-neutral-700 mb-3">This chakra has excessive energy, which may be creating imbalances in how you express and process this energy.</p>
                              <div className="mb-3">
                                <h5 className="text-sm font-semibold mb-1">Common Symptoms:</h5>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {Array.isArray(chakra.overactiveSymptoms) && 
                                    chakra.overactiveSymptoms.map((symptom, index) => (
                                      <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                        {symptom}
                                      </span>
                                    ))
                                  }
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-red-200">
                                <h5 className="text-sm font-semibold mb-1">Calming Practices:</h5>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {chakra.healingPractices.slice(0, 5).map((practice, index) => (
                                    <li key={index}>{practice}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Detailed analysis for chakra */}
                              {(
                                <div className="mt-6 bg-gradient-to-r from-red-50 to-neutral-50 p-4 rounded-lg border border-red-100">
                                  <div className="flex items-center mb-3">
                                    <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mr-2">
                                      <span className="text-red-700 text-xs">D</span>
                                    </div>
                                    <h5 className="text-red-800 font-medium">Detailed Analysis</h5>
                                  </div>
                                  
                                  {(() => {
                                    // Get detailed status with chakra key
                                    const detailedStatus = getChakraStatus(chakraValues[key], chakra.key);
                                    
                                    if (detailedStatus.detailedAnalysis) {
                                      return (
                                        <div className="space-y-4 text-sm">
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Behavioral Patterns You May Experience:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.behavioralPatterns.map((pattern, index) => (
                                                <li key={index}>{pattern}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">How This Affects Your Daily Life:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.dailyLifeImpacts.map((impact, index) => (
                                                <li key={index}>{impact}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Potential Root Causes:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.rootCauses.map((cause, index) => (
                                                <li key={index}>{cause}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          
                                          <div>
                                            <h6 className="font-medium mb-2 text-neutral-800">Personalized Healing Recommendations:</h6>
                                            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                                              {detailedStatus.detailedAnalysis.personalizedRecommendations.map((recommendation, index) => (
                                                <li key={index}>{recommendation}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    return null;
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Physical Associations</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Array.isArray(chakra.physicalAssociations) ? 
                                chakra.physicalAssociations.map((item, index) => (
                                  <span key={index} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {item}
                                  </span>
                                )) : (
                                  <span className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {String(chakra.physicalAssociations || '')}
                                  </span>
                                )
                              }
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold mb-2">Psychological Associations</h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Array.isArray(chakra.psychologicalAssociations) ? 
                                chakra.psychologicalAssociations.map((item, index) => (
                                  <span key={index} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {item}
                                  </span>
                                )) : (
                                  <span className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                                    {String(chakra.psychologicalAssociations || '')}
                                  </span>
                                )
                              }
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Recommended Affirmations</h4>
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg">
                            <ul className="list-disc pl-5 text-sm space-y-2">
                              {Array.isArray(chakra.affirmations) && 
                                chakra.affirmations.map((affirmation, index) => (
                                  <li key={index} className="italic">{affirmation}</li>
                                ))
                              }
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {Object.entries(recommendations).map(([chakraKey, recs]) => {
                  const chakraInfo = chakras.find(c => c.key === chakraKey);
                  if (!chakraInfo || !Array.isArray(recs) || recs.length === 0) return null;

                  return (
                    <Card key={chakraKey}>
                      <CardHeader className="pb-3 border-l-4" style={{ borderColor: chakraInfo.color }}>
                        <CardTitle className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-3"
                            style={{ backgroundColor: chakraInfo.color }}
                          ></div>
                          Recommendations for {chakraInfo.name}
                        </CardTitle>
                        <CardDescription>
                          Personalized healing recommendations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-3">
                          {recs.map((rec, idx) => (
                            <li key={idx} className="p-3 bg-neutral-50 rounded-lg">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="coaching" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">AI Coach Guidance</CardTitle>
                    <CardDescription>
                      Get personalized coaching based on your assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <h3 className="text-lg font-medium mb-3">Your Coaching Recommendation</h3>
                        <p className="mb-4">{coachingRecommendations.generalRecommendation}</p>

                        <div className="flex items-center gap-4 p-3 bg-[#483D8B]/10 rounded-lg mb-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: "#483D8B" }}
                          >
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">Recommended Coach</p>
                            <p className="text-sm text-neutral-600">{coachingRecommendations.recommendedCoach} Coach</p>
                          </div>
                        </div>

                        <p className="text-sm mb-4">
                          Based on your chakra profile, we recommend connecting with our {coachingRecommendations.recommendedCoach} Coach 
                          who specializes in {coachingRecommendations.focusChakra.name} chakra healing and balancing.
                        </p>

                        <Button 
                          className="w-full bg-[#483D8B] hover:bg-opacity-90"
                          onClick={() => setLocation(`/coach/${coachingRecommendations.recommendedCoach}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Coaching Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Chakra Assessment History Section */}
        <div className="mb-8 chakra-report-section">
          <Card>
            <CardHeader>
              <CardTitle>Your Chakra Journey</CardTitle>
              <CardDescription>
                Track your energetic progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {journalEntries && journalEntries.length > 2 ? (
                <div className="space-y-4">
                  <p className="text-neutral-700">
                    Your chakra balance has evolved since you began your healing journey. This timeline reflects your progress:
                  </p>

                  <div className="relative border-l-2 border-[#483D8B] pl-6 py-2 ml-2 space-y-8">
                    {/* Display first assessment date */}
                    <div className="relative">
                      <div className="absolute -left-[27px] h-4 w-4 rounded-full bg-[#483D8B]"></div>
                      <div>
                        <p className="font-medium">Initial Assessment</p>
                        <p className="text-sm text-neutral-600">{formatDate(new Date(chakraProfile.createdAt))}</p>
                        <p className="mt-1 text-sm">
                          This was the beginning of your energy healing journey with Scattered Lights.
                        </p>
                      </div>
                    </div>

                    {/* Journal entries as milestones (limit to 2-3 entries) */}
                    {journalEntries.slice(-3, -1).map((entry: { createdAt: string, content: string }, idx: number) => (
                      <div className="relative" key={idx}>
                        <div className="absolute -left-[27px] h-4 w-4 rounded-full bg-[#483D8B]"></div>
                        <div>
                          <p className="font-medium">Healing Milestone</p>
                          <p className="text-sm text-neutral-600">{formatDate(new Date(entry.createdAt))}</p>
                          <p className="mt-1 text-sm line-clamp-2">
                            {entry.content ? 
                              entry.content.substring(0, 120) + (entry.content.length > 120 ? '...' : '') 
                              : 'You continued your energy healing journey.'}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Current assessment */}
                    <div className="relative">
                      <div className="absolute -left-[30px] h-6 w-6 rounded-full border-4 border-[#483D8B] bg-white"></div>
                      <div>
                        <p className="font-semibold">Current Assessment</p>
                        <p className="text-sm text-neutral-600">{formatDate(new Date(chakraProfile.updatedAt))}</p>
                        <p className="mt-1">
                          Your current overall balance: <span className="font-medium">{overallBalance.status}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-neutral-600 mb-3">
                    This is the beginning of your chakra healing journey. As you continue to use Scattered Lights, we'll track your progress and show your energetic evolution over time.
                  </p>
                  <p className="text-sm">
                    Current assessment date: {formatDate(new Date(chakraProfile.updatedAt))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8 chakra-report-section">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive AI Analysis</CardTitle>
              <CardDescription>
                Deep analysis of your chakra profile and personalized guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Holistic Energy Assessment</h3>
                <p className="text-neutral-700 mb-4">
                  {overallBalance.description}
                </p>

                <p className="text-neutral-700">
                  Your energy system shows {
                    Object.values(chakraValues).filter(v => v >= 7).length > 3 ? 
                      'a tendency toward overactive chakras, which may manifest as intensity, overthinking, or heightened emotional responses' :
                    Object.values(chakraValues).filter(v => v <= 4).length > 3 ?
                      'several underactive chakras, which can create feelings of blockage, stagnation, or disconnection in various areas of your life' :
                      'a relatively balanced distribution of energy, though with specific areas that could benefit from targeted attention'
                  }. Working with a focused approach on each chakra will help you achieve greater harmony.
                </p>
              </div>

              <h3 className="text-lg font-medium mt-4">Key Findings &amp; Recommendations</h3>

              {/* Top 3 chakras needing attention */}
              <div className="mt-2 space-y-4">
                {Object.entries(chakraValues)
                  .sort((a, b) => Math.abs(b[1] - 5) - Math.abs(a[1] - 5))
                  .slice(0, 3)
                  .map(([key, value]) => {
                    const chakraInfo = chakras.find(c => c.key === key);
                    const status = getChakraStatus(value);
                    if (!chakraInfo) return null;

                    return (
                      <div className="p-4 bg-white border rounded-lg shadow-sm" key={key}>
                        <div className="flex items-start gap-3 mb-3">
                          <div 
                            className="h-8 w-8 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: chakraInfo.color }}
                          ></div>
                          <div>
                            <p className="font-medium text-lg">{chakraInfo.name} ({chakraInfo.sanskritName})</p>
                            <p className="text-sm" style={{ color: chakraInfo.color }}>
                              Current state: <span className="font-medium">{status.status}</span> ({value}/10)
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-1">Key Issues:</h4>
                          <p className="text-neutral-700 mb-2">
                            {value > 7 ? 
                              `Your ${chakraInfo.name} chakra is overactive, potentially causing ${chakraInfo.overactiveSymptoms.slice(0, 3).join(', ')}. This excess energy may create imbalances in how you process and express ${chakraInfo.psychologicalAssociations.slice(0, 2).join(' and ')}.` :
                            value < 5 ?
                              `Your ${chakraInfo.name} chakra is underactive, which may manifest as ${chakraInfo.underactiveSymptoms.slice(0, 3).join(', ')}. This can diminish your capacity for ${chakraInfo.psychologicalAssociations.slice(0, 2).join(' and ')}.` :
                              `Your ${chakraInfo.name} chakra is relatively balanced but could benefit from regular maintenance to ensure continued harmony.`
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-1">Recommended Approach:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {value > 7 ? (
                              // For overactive
                              <>
                                <li>Practice grounding techniques daily to calm excessive energy</li>
                                <li>Incorporate {chakraInfo.element}-based meditation to balance this chakra</li>
                                <li>Use {chakraInfo.healingPractices[0]} and {chakraInfo.healingPractices[1]} regularly</li>
                              </>
                            ) : value < 5 ? (
                              // For underactive
                              <>
                                <li>Activate this chakra with daily focused attention and intention</li>
                                <li>Incorporate {chakraInfo.element}-based visualization practices</li>
                                <li>Use {chakraInfo.healingPractices[0]} and {chakraInfo.healingPractices[1]} regularly</li>
                              </>
                            ) : (
                              // For balanced
                              <>
                                <li>Maintain your current practices for this chakra</li>
                                <li>Continue incorporating {chakraInfo.element}-based activities</li>
                                <li>Use {chakraInfo.healingPractices[0]} for ongoing support</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })
                }
              </div>

              <div className="mt-6 p-4 bg-[#483D8B]/10 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Long-term Healing Journey</h3>
                <p className="mb-3">
                  Based on your current chakra profile, we recommend a {
                    Math.max(...Object.values(chakraValues)) - Math.min(...Object.values(chakraValues)) > 3 ?
                      'focused 8-12 week healing program that addresses your significant energy imbalances' :
                      '4-6 week fine-tuning approach to harmonize your already relatively balanced energy system'
                  }.
                </p>
                <p>
                  Consistent practice with Scattered Lights' guided healing rituals and regular check-ins with our AI coaches will help you achieve and maintain optimal energy balance and holistic well-being.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={generatePdfReport}
                  disabled={loadingPdf}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report
                </Button>
                <Button 
                  className="bg-[#483D8B] hover:bg-opacity-90"
                  onClick={() => {
                    setLocation(`/coach/${coachingRecommendations.recommendedCoach}`);
                  }}
                >
                  Book a Healing Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/chakra-assessment')}
          >
            Update Assessment
          </Button>
          <Button 
            onClick={generateTextReport} 
            disabled={loadingPdf}
          >
            {loadingPdf ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-current animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download Text Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}