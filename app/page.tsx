import Link from 'next/link'
import { 
  BookOpen, 
  Brain, 
  FileText, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Award
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Mainalyze
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto fade-in">
            <div className="inline-flex items-center space-x-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered UPSC Preparation</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Master <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">UPSC</span> with
              <br />Intelligent Learning
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Get personalized AI feedback on your Mains answers and practice adaptive Prelims questions. 
              Designed for serious UPSC aspirants who want to excel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-white text-black rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#features"
                className="px-8 py-4 bg-slate-800 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold text-lg border border-slate-700"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for UPSC preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Mains Evaluation */}
            <div className="group bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl border border-slate-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Mains Answer Evaluation</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Upload handwritten or typed answers and get detailed AI-powered feedback on structure, content, and presentation within minutes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Supports PDF, JPG, PNG formats</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Detailed feedback on 10+ parameters</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Personalized mentor guidance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Track improvement over time</span>
                </li>
              </ul>
            </div>

            {/* Prelims Practice */}
            <div className="group bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl border border-slate-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Prelims Practice</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Generate unlimited MCQ questions on any topic with three difficulty levels, tailored to your preparation needs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Custom topics of your choice</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">3 difficulty levels</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Instant AI explanations for wrong answers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Session history and analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:shadow-lg transition-all duration-200">
              <Target className="w-10 h-10 text-white mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Personalized Learning</h4>
              <p className="text-slate-300">AI adapts to your strengths and weaknesses for targeted improvement.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:shadow-lg transition-all duration-200">
              <TrendingUp className="w-10 h-10 text-white mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Progress Tracking</h4>
              <p className="text-slate-300">Monitor your improvement with detailed analytics and performance insights.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:shadow-lg transition-all duration-200">
              <Award className="w-10 h-10 text-white mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Expert Guidance</h4>
              <p className="text-slate-300">Get mentor-level suggestions on how to improve each aspect of your answer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              How It <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-2xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sign Up</h3>
              <p className="text-slate-300">
                Create your free account in seconds. No credit card required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-2xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload or Generate</h3>
              <p className="text-slate-300">
                Upload your Mains answers or generate Prelims questions on any topic.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-2xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Learn & Improve</h3>
              <p className="text-slate-300">
                Get instant AI feedback and track your progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Built for <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Security</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your data and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Bank-Level Security</h4>
              <p className="text-sm text-slate-300">End-to-end encryption for all your data</p>
            </div>
            <div className="text-center p-6">
              <Zap className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-sm text-slate-300">Get feedback in under 2 minutes</p>
            </div>
            <div className="text-center p-6">
              <Users className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Data Privacy</h4>
              <p className="text-sm text-slate-300">Your data stays private and secure</p>
            </div>
            <div className="text-center p-6">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Reliable Service</h4>
              <p className="text-sm text-slate-300">Consistent and dependable platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Ace Your UPSC Exam?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Start your preparation journey with AI-powered tools designed for UPSC aspirants
          </p>
          <Link 
            href="/auth/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-black rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold text-lg"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-300 mt-4 text-sm">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">Mainalyze</span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered UPSC preparation platform for serious aspirants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Mains Evaluation</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Prelims Practice</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Progress Tracking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 Mainalyze by FirebringerLabs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
