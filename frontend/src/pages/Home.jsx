import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Brain, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <main className="pt-32 pb-16 md:pt-48 md:pb-32 px-6 relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] opacity-30 blur-[100px] rounded-full bg-gradient-to-b from-brand-100 to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-[#09090B] tracking-tight leading-[1.1] mb-8 mt-12">
              Blood coordination on <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-rose-500">Autopilot</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#52525B] max-w-2xl mx-auto mb-10 leading-relaxed">
              Ensuring every Thalassemia patient gets blood on time through AI-powered matching, automated outreach, and intelligent scheduling.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-base bg-brand-600 hover:bg-brand-700 shadow-brand group">
                  Join as Donor
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base border-[#E4E4E7] text-[#09090B] hover:bg-[#F4F4F5]">
                  Hospital Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-[#FAFAFA] border-y border-[#F4F4F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-[#09090B] tracking-tight mb-4">Built for reliability</h2>
            <p className="text-[#52525B] max-w-xl mx-auto">Our platform eliminates the stress of finding donors during emergencies with predictive modeling and automated communication.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[24px] border border-[#F4F4F5] shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#09090B] mb-3">AI Matching</h3>
              <p className="text-[#52525B] leading-relaxed">
                Our SageMaker models analyze donor reliability, location, and blood groups to instantly connect the right donors with critical patients.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-[#F4F4F5] shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#09090B] mb-3">Automated Outreach</h3>
              <p className="text-[#52525B] leading-relaxed">
                Smart WhatsApp and Telegram bots automatically notify donors exactly when they are eligible, preventing burnout and missed cycles.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-[#F4F4F5] shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#09090B] mb-3">Verified Network</h3>
              <p className="text-[#52525B] leading-relaxed">
                Hospital administrators can securely manage requests, oversee inventory, and trust that every donor in the pool is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-[#09090B] tracking-tight mb-8">Ready to save lives?</h2>
        <Link to="/register">
          <Button size="lg" className="rounded-full px-8 h-14 text-base bg-[#09090B] hover:bg-[#27272A] text-white">
            Create your account
          </Button>
        </Link>
      </footer>
    </div>
  );
}

