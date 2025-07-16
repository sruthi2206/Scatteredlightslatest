import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChakraWheel from "@/components/ChakraWheel";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-body">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">Scattered Lights</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="font-heading text-neutral-900 hover:text-[#008080] transition-colors">Features</a>
            <a href="#journey" className="font-heading text-neutral-900 hover:text-[#008080] transition-colors">Journey</a>
            <a href="#ai-coaches" className="font-heading text-neutral-900 hover:text-[#008080] transition-colors">AI Coaches</a>
            <a href="#dashboard" className="font-heading text-neutral-900 hover:text-[#008080] transition-colors">Dashboard</a>
          </div>
          <div>
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-[#483D8B] text-white hover:bg-opacity-90 transition-colors">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#483D8B] text-white hover:bg-opacity-90 transition-colors">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="pt-28 pb-20 bg-neutral-50 relative overflow-hidden" id="hero">
        <motion.div 
          className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1563315657-49485b398660?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')]"
          style={{ 
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ y: 0 }}
          animate={{
            y: [0, -10, 0],
            transition: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080] font-cormorant">
                From Fragmentation to Radiance : Your Path with Scattered Lights
              </h1>
              <p className="text-lg md:text-xl text-neutral-900 mb-8 max-w-md font-cormorant">
                Awaken your inner light, embark on a journey of chakra alignment, emotional clarity, and shadow healing, supported by a loving community that sees and celebrates your growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button className="bg-[#008080] text-white px-8 py-6 rounded-full font-heading font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
                    Begin Your Journey
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" className="border border-[#483D8B] text-[#483D8B] px-8 py-6 rounded-full font-heading font-medium hover:bg-[#483D8B] hover:text-white transition-all">
                    Learn More
                  </Button>
                </a>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ChakraWheel animated={true} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">Core Features</h2>
            <p className="text-neutral-900 max-w-2xl mx-auto">Discover the tools that will guide your personal growth journey</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-neutral-50 rounded-xl p-8 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mb-6`}>
                  <i className={`${feature.icon} text-2xl ${feature.iconColor}`}></i>
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-900/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Process */}
      <section className="py-20 bg-neutral-50" id="journey">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">Your Healing Journey</h2>
            <p className="text-neutral-900 max-w-2xl mx-auto">A personalized path to inner transformation and emotional freedom</p>
          </motion.div>
          
          <div className="relative">
            {/* Journey Path Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#483D8B] via-[#008080] to-[#7DF9FF] transform -translate-x-1/2"></div>
            
            <div className="space-y-12 md:space-y-24 relative">
              {journeySteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} mb-6 md:mb-0`}>
                    <h3 className={`text-2xl font-heading font-semibold mb-3 ${step.color}`}>{step.title}</h3>
                    <p className="text-neutral-900">{step.description}</p>
                  </div>
                  <div className="md:hidden w-10 h-10 rounded-full bg-[#483D8B] flex items-center justify-center text-white font-bold my-4">
                    {index + 1}
                  </div>
                  <div className={`hidden md:flex w-16 h-16 rounded-full ${step.bgColor} flex-shrink-0 items-center justify-center text-white font-bold z-10`}>
                    {index + 1}
                  </div>
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <img src={step.image} alt={step.title} className="w-full h-48 object-cover" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Coaches Section */}
      <section className="py-20 bg-white" id="ai-coaches">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">Meet Your AI Coaches</h2>
            <p className="text-neutral-900 max-w-2xl mx-auto">Each coach specializes in a different aspect of your inner healing journey</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map((coach, index) => (
              <motion.div 
                key={index}
                className="bg-neutral-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="p-8 pb-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full ${coach.gradient} flex items-center justify-center`}>
                      <i className={`${coach.icon} text-xl text-white`}></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-heading font-semibold">{coach.name}</h3>
                      <p className="text-sm text-neutral-900/70">{coach.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-neutral-900 mb-6">{coach.description}</p>
                  
                  {/* Chat Example */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <div className="flex items-start mb-3">
                      <div className={`w-8 h-8 rounded-full ${coach.chatBgColor} flex-shrink-0 flex items-center justify-center`}>
                        <i className={`${coach.icon} text-sm ${coach.chatIconColor}`}></i>
                      </div>
                      <div className={`ml-3 ${coach.chatMsgBg} p-3 rounded-lg max-w-[80%]`}>
                        <p className="text-sm text-neutral-900">{coach.sampleQuestion}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-end">
                      <div className="mr-3 bg-white border border-neutral-900/10 p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm text-neutral-900">{coach.sampleResponse}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-neutral-900/10 flex-shrink-0 flex items-center justify-center">
                        <i className="ri-user-line text-sm text-neutral-900"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-8 pb-8">
                  <Link href={`/coach/${coach.type}`}>
                    <Button className={`w-full ${coach.buttonBg} text-white py-6 rounded-lg font-heading font-medium hover:bg-opacity-90 transition-colors`}>
                      Connect with {coach.buttonText}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-neutral-50" id="dashboard">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">Your Healing Dashboard</h2>
            <p className="text-neutral-900 max-w-2xl mx-auto">Track your progress and visualize your transformation</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="border-b border-neutral-50">
              <div className="flex overflow-x-auto scrollbar-hide">
                <button className="px-6 py-4 text-[#483D8B] border-b-2 border-[#483D8B] font-heading font-medium">Overview</button>
                <button className="px-6 py-4 text-neutral-900/70 hover:text-neutral-900 font-heading font-medium">Chakra Balance</button>
                <button className="px-6 py-4 text-neutral-900/70 hover:text-neutral-900 font-heading font-medium">Emotional Map</button>
                <button className="px-6 py-4 text-neutral-900/70 hover:text-neutral-900 font-heading font-medium">Journal Insights</button>
                <button className="px-6 py-4 text-neutral-900/70 hover:text-neutral-900 font-heading font-medium">Healing Rituals</button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Chakra & Energy */}
                <div>
                  <h3 className="text-lg font-heading font-medium mb-4">Chakra Balance</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-center mb-4">
                      <ChakraWheel size={180} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-900/70">Heart Chakra</span>
                        <span className="text-sm font-medium text-green-500">Balanced</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-900/70">Solar Plexus</span>
                        <span className="text-sm font-medium text-yellow-500">Slightly Blocked</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-900/70">Throat Chakra</span>
                        <span className="text-sm font-medium text-red-500">Needs Attention</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-heading font-medium mb-4">Today's Energy</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-900/70">Energy Level</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-[#7DF9FF]"></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-900/70">Emotional Balance</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[70%] h-full bg-[#7DF9FF]"></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">70%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-900/70">Mental Clarity</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[55%] h-full bg-yellow-500"></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">55%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Middle Column - Journal & Mood */}
                <div>
                  <h3 className="text-lg font-heading font-medium mb-4">Recent Journal Insights</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Yesterday's Entry</span>
                          <span className="text-xs text-neutral-900/60">8:30 PM</span>
                        </div>
                        <p className="text-sm text-neutral-900">I noticed a pattern of anxiety when thinking about my presentation next week. The shadow coach helped me see how perfectionism is affecting me.</p>
                        <div className="mt-2 flex space-x-2">
                          <span className="px-2 py-1 bg-[#483D8B]/10 text-[#483D8B] text-xs rounded-full">Perfectionism</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Anxiety</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">3 Days Ago</span>
                          <span className="text-xs text-neutral-900/60">7:15 PM</span>
                        </div>
                        <p className="text-sm text-neutral-900">My meditation today helped me connect with a sense of peace I haven't felt in weeks. The throat chakra exercise was particularly powerful.</p>
                        <div className="mt-2 flex space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Throat Chakra</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Inner Peace</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-heading font-medium mb-4">Mood Tracker</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-900/70 w-16">Today</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">😌</span>
                          <div className="h-2 w-20 bg-[#7DF9FF] rounded-full"></div>
                          <span className="text-xs font-medium">Calm</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-900/70 w-16">Yesterday</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">😣</span>
                          <div className="h-2 w-20 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs font-medium">Stressed</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-900/70 w-16">Tuesday</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">😊</span>
                          <div className="h-2 w-20 bg-[#7DF9FF] rounded-full"></div>
                          <span className="text-xs font-medium">Happy</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-900/70 w-16">Monday</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">😐</span>
                          <div className="h-2 w-20 bg-blue-400 rounded-full"></div>
                          <span className="text-xs font-medium">Neutral</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Recommendations */}
                <div>
                  <h3 className="text-lg font-heading font-medium mb-4">Today's Recommendations</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                    <h4 className="font-heading font-medium mb-2">Throat Chakra Healing</h4>
                    <p className="text-sm text-neutral-900 mb-3">Based on your recent entries, focusing on throat chakra expression could help balance your energy.</p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i className="ri-volume-up-line text-blue-500"></i>
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium">Sacred Sound Meditation</h5>
                          <p className="text-xs text-neutral-900/70">10 min • Expression & Release</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i className="ri-edit-line text-blue-500"></i>
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium">Truth-Speaking Journal Prompt</h5>
                          <p className="text-xs text-neutral-900/70">5 min • Written Expression</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="font-heading font-medium mb-2">Weekly Progress</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-900/70">Self-Awareness</span>
                          <span className="text-xs font-medium text-[#483D8B]">+12%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[72%] h-full bg-[#483D8B]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-900/70">Emotional Balance</span>
                          <span className="text-xs font-medium text-[#008080]">+8%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-[#008080]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-neutral-900/70">Chakra Alignment</span>
                          <span className="text-xs font-medium text-[#7DF9FF]">+15%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-900/10 rounded-full overflow-hidden">
                          <div className="w-[58%] h-full bg-[#7DF9FF]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#483D8B] via-[#008080] to-[#7DF9FF] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Begin Your Healing Journey Today</h2>
            <p className="max-w-2xl mx-auto mb-10 text-white/90">Discover the power of AI-guided inner work and transform your relationship with yourself</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/onboarding">
                <Button className="bg-white text-[#483D8B] px-8 py-6 rounded-full font-heading font-medium hover:bg-opacity-90 transition-all shadow-lg">
                  Start Free Trial
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="border border-white text-white px-8 py-6 rounded-full font-heading font-medium hover:bg-white hover:text-[#483D8B] transition-all">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#7DF9FF] to-[#E6E6FA]">Scattered Lights</h3>
              <p className="text-white/70 mb-4">AI-powered inner healing and spiritual growth to nurture your authentic self.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white transition-colors"><i className="ri-instagram-line text-lg"></i></a>
                <a href="#" className="text-white/70 hover:text-white transition-colors"><i className="ri-facebook-circle-line text-lg"></i></a>
                <a href="#" className="text-white/70 hover:text-white transition-colors"><i className="ri-twitter-line text-lg"></i></a>
                <a href="#" className="text-white/70 hover:text-white transition-colors"><i className="ri-youtube-line text-lg"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-medium mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">AI Coaches</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Chakra Balancing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Emotional Tracking</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Guided Journaling</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Personalized Rituals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Meditation Library</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Chakra Guide</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Community Forum</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Expert Interviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Our Approach</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            <p>© 2023 Scattered Lights. All rights reserved. Nurturing authentic selves through technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Features data
const features = [
  {
    title: "AI Coaches",
    description: "Four unique AI personalities to guide different aspects of your healing journey.",
    icon: "ri-mental-health-line",
    iconColor: "text-[#483D8B]",
    bgColor: "bg-[#483D8B]/10"
  },
  {
    title: "Guided Journaling",
    description: "AI-powered prompts and emotion detection to deepen your self-awareness.",
    icon: "ri-book-open-line",
    iconColor: "text-[#008080]",
    bgColor: "bg-[#008080]/10"
  },
  {
    title: "Emotional Mapping",
    description: "Visualize your emotional landscape and track patterns over time.",
    icon: "ri-emotion-line",
    iconColor: "text-[#FF69B4]",
    bgColor: "bg-[#FF69B4]/10"
  },
  {
    title: "Chakra Balancing",
    description: "Personalized practices to align and heal your energy centers.",
    icon: "ri-spy-line",
    iconColor: "text-[#7DF9FF]",
    bgColor: "bg-[#7DF9FF]/10"
  },
  {
    title: "Healing Rituals",
    description: "Custom recommendations for visualizations, affirmations, and practices.",
    icon: "ri-meditation-line",
    iconColor: "text-[#191970]",
    bgColor: "bg-[#191970]/10"
  },
  {
    title: "Progress Tracking",
    description: "Monitor your growth with intuitive visualizations and insights.",
    icon: "ri-line-chart-line",
    iconColor: "text-[#483D8B]",
    bgColor: "bg-[#483D8B]/10"
  }
];

// Journey steps data
const journeySteps = [
  {
    title: "Discovery",
    description: "Begin with an in-depth chakra scan and emotional assessment to create your unique profile.",
    color: "text-[#483D8B]",
    bgColor: "bg-[#483D8B]",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "AI Coaching",
    description: "Connect with specialized AI coaches tailored to different aspects of your inner work.",
    color: "text-[#008080]",
    bgColor: "bg-[#008080]",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Reflection",
    description: "Document your journey through AI-guided journaling with emotion and pattern recognition.",
    color: "text-[#FF69B4]",
    bgColor: "bg-[#FF69B4]",
    image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Integration",
    description: "Transform insights into action with personalized practices and track your growth over time.",
    color: "text-[#7DF9FF]",
    bgColor: "bg-[#7DF9FF]",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

// AI coaches data
const coaches = [
  {
    name: "Inner Child Coach",
    subtitle: "Healing wounds from the past",
    description: "Gentle, nurturing guidance to heal childhood wounds and reconnect with your authentic self.",
    type: "inner_child",
    icon: "ri-user-heart-line",
    gradient: "bg-gradient-to-r from-[#7DF9FF] to-[#E6E6FA]",
    chatBgColor: "bg-[#7DF9FF]/20",
    chatIconColor: "text-[#7DF9FF]",
    chatMsgBg: "bg-[#7DF9FF]/10",
    buttonBg: "bg-[#7DF9FF]",
    buttonText: "Inner Child Coach",
    sampleQuestion: "When was the last time you felt truly safe to express yourself? What helped create that feeling of safety?",
    sampleResponse: "I felt safe when my friend just listened without judgment..."
  },
  {
    name: "Shadow Self Coach",
    subtitle: "Embracing your whole self",
    description: "Direct, insightful guidance to identify and integrate rejected aspects of yourself.",
    type: "shadow_self",
    icon: "ri-contrast-2-line",
    gradient: "bg-gradient-to-r from-[#191970] to-[#483D8B]",
    chatBgColor: "bg-[#191970]/20",
    chatIconColor: "text-[#191970]",
    chatMsgBg: "bg-[#191970]/10",
    buttonBg: "bg-[#191970]",
    buttonText: "Shadow Coach",
    sampleQuestion: "What quality in others tends to trigger a strong negative reaction in you? This often points to disowned parts of yourself.",
    sampleResponse: "I get really frustrated with people who seem self-centered..."
  },
  {
    name: "Higher Self Coach",
    subtitle: "Connecting to your essence",
    description: "Expansive, wisdom-focused guidance to connect with your highest potential and purpose.",
    type: "higher_self",
    icon: "ri-sun-line",
    gradient: "bg-gradient-to-r from-[#483D8B] to-[#FF69B4]",
    chatBgColor: "bg-[#483D8B]/20",
    chatIconColor: "text-[#483D8B]",
    chatMsgBg: "bg-[#483D8B]/10",
    buttonBg: "bg-[#483D8B]",
    buttonText: "Higher Self Coach",
    sampleQuestion: "If you were living fully aligned with your deepest values, what would tomorrow look like? What would be different?",
    sampleResponse: "I would start my day with meditation instead of checking my phone..."
  },
  {
    name: "Integration Coach",
    subtitle: "Unifying your journey",
    description: "Practical, holistic guidance to integrate insights into daily life and track your progress.",
    type: "integration",
    icon: "ri-scales-3-line",
    gradient: "bg-gradient-to-r from-[#008080] to-[#7DF9FF]",
    chatBgColor: "bg-[#008080]/20",
    chatIconColor: "text-[#008080]",
    chatMsgBg: "bg-[#008080]/10",
    buttonBg: "bg-[#008080]",
    buttonText: "Integration Coach",
    sampleQuestion: "Let's create a small, achievable ritual that helps you practice self-compassion. What might feel both nourishing and realistic?",
    sampleResponse: "Maybe taking 5 minutes each morning to journal what I'm grateful for..."
  }
];
