import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Check,
  ArrowLeft,
  Clock,
  PlayCircle,
  BookOpen,
  Users,
  X,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RitualCoursePage() {
  const params = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLessonVideoOpen, setIsLessonVideoOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{
    title: string;
    videoUrl: string;
  } | null>(null);
  const courseId = params.courseId;

  // Fetch ritual course data
  const { data: ritual, isLoading } = useQuery({
    queryKey: ["/api/healing-rituals", courseId],
    queryFn: async () => {
      try {
        // Use a regular fetch since we've removed auth requirement on this endpoint
        const res = await fetch(`/api/healing-rituals/${courseId}`);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch ritual details: ${errorText}`);
        }

        return await res.json();
      } catch (error) {
        console.error("Error fetching ritual details:", error);
        return null;
      }
    },
    enabled: !!courseId, // Only need the courseId now
  });

  // Loading state
  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  // Not found state
  if (!ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/healing-rituals")}>
            Back to Healing Rituals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{ritual.name} | Scattered Lights Courses</title>
        <meta name="description" content={ritual.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 bg-gradient-to-r from-purple-900 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/0" />

          <div className="container relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/healing-rituals")}
              className="mb-8 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rituals
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  {ritual.targetChakra && (
                    <Badge className="bg-white text-purple-700">
                      {ritual.targetChakra
                        .replace("_", " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}{" "}
                      Chakra
                    </Badge>
                  )}
                  {ritual.targetEmotion && (
                    <Badge className="bg-white text-purple-700">
                      {ritual.targetEmotion.replace(/\b\w/g, (l: string) =>
                        l.toUpperCase(),
                      )}
                    </Badge>
                  )}
                  <Badge className="bg-white/10">
                    <Clock className="h-3 w-3 mr-1" />
                    {ritual.duration || "15 minutes"}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  {ritual.name}
                </h1>

                <p className="text-lg text-white/90 mb-8 max-w-3xl">
                  {ritual.description}
                </p>

                <div className="flex items-center space-x-4 mb-8">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage
                      src="/images/instructor.jpg"
                      alt="Instructor"
                    />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">With Sarah Johnson</div>
                    <div className="text-sm text-white/70">
                      Spiritual Guide & Healing Practitioner
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-white/90"
                    onClick={() => {
                      // Smooth scroll to the video section in the overview tab
                      setActiveTab("overview");
                      setTimeout(() => {
                        const videoSection = document.getElementById(
                          "practice-video-section",
                        );
                        if (videoSection) {
                          videoSection.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }, 100);
                    }}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Practice
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => {
                      // This could be linked to a downloadable PDF guide in the future
                      alert("Practice guide coming soon!");
                    }}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Download Guide
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                  <img
                    src={
                      ritual.mainImageUrl || "/images/placeholder-course.jpg"
                    }
                    alt={ritual.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="h-16 w-16 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40"
                    >
                      <PlayCircle className="h-10 w-10 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content Section */}
        <section className="py-16 px-4 md:px-8">
          <div className="container max-w-7xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-10">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        About This Course
                      </h2>
                      <p className="text-gray-700 mb-4">{ritual.description}</p>
                      <p className="text-gray-700">
                        This course is designed to help you connect with your
                        inner self, balance your chakras, and release emotional
                        blockages that may be preventing you from living your
                        best life. Through guided meditations, breathing
                        exercises, and powerful visualizations, you'll
                        experience deep healing and transformation.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        What You'll Learn
                      </h2>
                      <ul className="space-y-3">
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>
                            How to effectively balance and align your{" "}
                            {ritual.targetChakra || "chakras"}
                          </span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>
                            Powerful techniques to release emotional blockages
                          </span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>
                            Daily practices to maintain spiritual balance
                          </span>
                        </li>
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>
                            How to integrate these teachings into your everyday
                            life
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        Course Details
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">
                            {ritual.duration || "15 minutes"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Practice Type
                          </div>
                          <div className="font-medium">
                            {ritual.type || "Meditation"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Level</div>
                          <div className="font-medium">All Levels</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Students</div>
                          <div className="font-medium">1,234</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">
                          Practice Instructions
                        </h3>
                        <div className="text-gray-700 whitespace-pre-line">
                          {ritual.instructions || (
                            <>
                              1. Find a quiet, comfortable space where you won't
                              be disturbed. 2. Sit in a comfortable position
                              with your spine straight. 3. Close your eyes and
                              take several deep breaths. 4. Follow the guided
                              meditation, focusing on your{" "}
                              {ritual.targetChakra || "chakras"}. 5. When
                              complete, gently bring your awareness back to your
                              surroundings.
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div id="practice-video-section" className="mt-6 space-y-4">
                      {ritual.videoUrl ? (
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={ritual.videoUrl}
                            className="w-full h-full"
                            title={`${ritual.name} Video`}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          ></iframe>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => {
                            if (ritual.courseUrl) {
                              window.open(ritual.courseUrl, "_blank");
                            } else {
                              alert(
                                "This practice is coming soon. Please check back later!",
                              );
                            }
                          }}
                        >
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Start Practice Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-8">Course Curriculum</h2>

                  <div className="space-y-6">
                    <Card className="border border-purple-100 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 font-medium"
                              >
                                Lesson 1
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {ritual.lesson1Duration
                                  ? ritual.lesson1Duration.replace(
                                      "min",
                                      " minutes",
                                    )
                                  : (ritual.duration || "30min").replace(
                                      "min",
                                      " minutes",
                                    )}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">
                              {ritual.lesson1Title ||
                                `Introduction to ${ritual.name}`}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {ritual.lesson1Description ||
                                "Learn the basics and prepare for your journey"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-purple-50"
                            onClick={() => {
                              if (ritual.lesson1VideoUrl) {
                                setActiveLesson({
                                  title:
                                    ritual.lesson1Title ||
                                    `Introduction to ${ritual.name}`,
                                  videoUrl: ritual.lesson1VideoUrl,
                                });
                                setIsLessonVideoOpen(true);
                              } else {
                                toast({
                                  title: "Video not available",
                                  description:
                                    "This lesson's video is not yet available.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <PlayCircle className="h-6 w-6 text-purple-700" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-100 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 font-medium"
                              >
                                Lesson 2
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {ritual.lesson2Duration
                                  ? ritual.lesson2Duration.replace(
                                      "min",
                                      " minutes",
                                    )
                                  : "20 minutes"}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">
                              {ritual.lesson2Title || "The Guided Practice"}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {ritual.lesson2Description ||
                                "Deep dive into the main exercise and techniques"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-purple-50"
                            onClick={() => {
                              if (ritual.lesson2VideoUrl) {
                                setActiveLesson({
                                  title:
                                    ritual.lesson2Title ||
                                    "The Guided Practice",
                                  videoUrl: ritual.lesson2VideoUrl,
                                });
                                setIsLessonVideoOpen(true);
                              } else {
                                toast({
                                  title: "Video not available",
                                  description:
                                    "This lesson's video is not yet available.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <PlayCircle className="h-6 w-6 text-purple-700" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-100 shadow-sm transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 font-medium"
                              >
                                Lesson 3
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {ritual.lesson3Duration
                                  ? ritual.lesson3Duration.replace(
                                      "min",
                                      " minutes",
                                    )
                                  : "10 minutes"}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">
                              {ritual.lesson3Title ||
                                "Integration & Daily Practice"}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {ritual.lesson3Description ||
                                "How to incorporate these teachings into your daily life"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-purple-50"
                            onClick={() => {
                              if (ritual.lesson3VideoUrl) {
                                setActiveLesson({
                                  title:
                                    ritual.lesson3Title ||
                                    "Integration & Daily Practice",
                                  videoUrl: ritual.lesson3VideoUrl,
                                });
                                setIsLessonVideoOpen(true);
                              } else {
                                toast({
                                  title: "Video not available",
                                  description:
                                    "This lesson's video is not yet available.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <PlayCircle className="h-6 w-6 text-purple-700" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 mb-8">
                    <Avatar className="h-28 w-28 border-2 border-purple-400 shadow-md mb-4 md:mb-0">
                      <AvatarImage
                        src="/images/instructor.jpg"
                        alt="Sarah Johnson"
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                        SJ
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-center md:text-left">
                        Sarah Johnson
                      </h2>
                      <p className="text-gray-600 mb-4 text-center md:text-left">
                        Spiritual Guide & Healing Practitioner
                      </p>
                      <div className="flex items-center space-x-4 justify-center md:justify-start mb-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-purple-600 mr-1" />
                          <span className="text-sm text-gray-600">
                            12,345 students
                          </span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-purple-600 mr-1" />
                          <span className="text-sm text-gray-600">
                            12 courses
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          Chakra Balancing
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          Energy Healing
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          Meditation
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4 text-purple-800">
                        About the Instructor
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        Sarah Johnson is a renowned spiritual guide and healing
                        practitioner with over 15 years of experience in the
                        fields of chakra healing, meditation, and energy work.
                      </p>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        Sarah's unique approach combines ancient wisdom with
                        modern techniques, making spiritual practices accessible
                        to everyone. Her teaching style is warm, approachable,
                        and deeply transformative.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        With a background in psychology and extensive training
                        in various healing modalities, Sarah has helped
                        thousands of students around the world connect with
                        their inner wisdom and create lasting positive change in
                        their lives.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Areas of Expertise
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Chakra Balancing</span>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Energy Healing</span>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Meditation</span>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Emotional Release</span>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Spiritual Guidance</span>
                        </div>
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="h-2 w-2 bg-purple-600 rounded-full mr-2"></div>
                          <span>Sound Healing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Related Courses Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="container max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-10 text-center">
              Related Courses You Might Like
            </h2>

            <RelatedCourses currentCourseId={Number(courseId)} />
          </div>
        </section>
      </div>

      {/* Lesson Video Dialog */}
      <Dialog open={isLessonVideoOpen} onOpenChange={setIsLessonVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3">
            <div className="flex justify-between items-center">
              <DialogTitle>{activeLesson?.title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsLessonVideoOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full">
            {activeLesson?.videoUrl && (
              <iframe
                src={activeLesson.videoUrl}
                className="w-full h-full"
                title={activeLesson.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Loading skeleton
function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="relative pt-24 pb-12 bg-gradient-to-r from-purple-900 to-indigo-800">
        <div className="container">
          <Skeleton className="h-10 w-32 mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex space-x-2 mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>

              <Skeleton className="h-12 w-3/4 mb-6" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-2/3 mb-8" />

              <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>

            <div className="hidden lg:block">
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <Skeleton className="h-10 w-full max-w-2xl mx-auto mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div>
              <Skeleton className="h-72 w-full rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Related Courses Component that fetches and displays similar ritual courses
function RelatedCourses({ currentCourseId }: { currentCourseId: number }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch all rituals to display related ones
  const { data: rituals = [], isLoading } = useQuery({
    queryKey: ['/api/healing-rituals'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/healing-rituals');
        if (!res.ok) throw new Error('Failed to fetch healing rituals');
        return await res.json();
      } catch (error) {
        console.error('Error fetching healing rituals:', error);
        return [];
      }
    },
  });
  
  // Filter out the current ritual and limit to 3 related rituals
  const relatedRituals = rituals
    .filter((ritual: any) => ritual.id !== currentCourseId)
    .slice(0, 3);
    
  // Map chakra name to appropriate badge color
  const getChakraColor = (chakra: string | null) => {
    if (!chakra) return { bg: "purple-50", text: "purple-700" };
    
    const chakraLower = chakra.toLowerCase();
    if (chakraLower.includes('root')) return { bg: "red-50", text: "red-700" };
    if (chakraLower.includes('sacral')) return { bg: "orange-50", text: "orange-700" };
    if (chakraLower.includes('solar plexus')) return { bg: "yellow-50", text: "yellow-700" };
    if (chakraLower.includes('heart')) return { bg: "green-50", text: "green-700" };
    if (chakraLower.includes('throat')) return { bg: "blue-50", text: "blue-700" };
    if (chakraLower.includes('third eye')) return { bg: "indigo-50", text: "indigo-700" };
    if (chakraLower.includes('crown')) return { bg: "violet-50", text: "violet-700" };
    
    return { bg: "purple-50", text: "purple-700" };
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // No related rituals state
  if (relatedRituals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No related courses found.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {relatedRituals.map((ritual: any) => {
        const chakraColors = getChakraColor(ritual.targetChakra);
        
        return (
          <Card
            key={ritual.id}
            className="overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="aspect-video w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
              <img
                src={ritual.mainImageUrl || `/images/${ritual.targetChakra?.toLowerCase().replace(' ', '_')}_chakra.jpg` || "/images/placeholder-course.jpg"}
                alt={ritual.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/images/placeholder-course.jpg") {
                    target.src = "/images/placeholder-course.jpg";
                  }
                }}
              />
              {ritual.targetChakra && (
                <span className="absolute bottom-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium z-20">
                  {ritual.targetChakra}
                </span>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                {ritual.targetChakra && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 font-medium"
                  >
                    {ritual.targetChakra}
                  </Badge>
                )}
                {ritual.duration && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700"
                  >
                    {ritual.duration}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {ritual.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {ritual.description}
              </p>
              <Button
                variant="outline"
                className="w-full hover:bg-purple-50 hover:text-purple-700 border-purple-200"
                onClick={() => setLocation(`/courses/${ritual.id}`)}
              >
                View Course
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
