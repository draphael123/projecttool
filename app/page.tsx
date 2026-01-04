import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Zap, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-rainbow opacity-90">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>
      
      {/* Floating shapes - more colorful */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-float" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main heading with gradient */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              CSV Report{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-pulse">
                Combiner
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Combine multiple CSV files into a single, beautifully formatted report
              based on your template schema
            </p>
          </div>

          {/* What is this tool? */}
          <div className="glass-effect rounded-2xl p-8 border-2 border-white/30 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              What is CSV Report Combiner?
            </h2>
            <div className="space-y-4 text-white/90 text-base md:text-lg leading-relaxed">
              <p>
                CSV Report Combiner is a powerful web-based tool that helps you merge, transform, and organize data from multiple CSV files into a single, unified report. Whether you're consolidating sales data, combining customer lists, or merging reports from different sources, this tool makes it easy.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="font-semibold text-lg mb-2 text-white">📊 Purpose</h3>
                  <p className="text-sm text-white/80">
                    Designed for professionals who need to combine multiple CSV files with different structures, apply transformations, filter data, remove duplicates, and generate clean, formatted reports.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="font-semibold text-lg mb-2 text-white">🎯 Use Cases</h3>
                  <p className="text-sm text-white/80">
                    Perfect for data analysts, business users, researchers, and anyone who regularly works with CSV data from multiple sources and needs to create unified reports.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="glass-effect rounded-xl p-6 card-hover border-2 border-purple-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-purple-900">Template-Based</h3>
              <p className="text-sm text-purple-700">
                Define your output structure with a template CSV file
              </p>
            </div>
            
            <div className="glass-effect rounded-xl p-6 card-hover border-2 border-blue-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-blue-900">Lightning Fast</h3>
              <p className="text-sm text-blue-700">
                Process multiple files with intelligent auto-mapping
              </p>
            </div>
            
            <div className="glass-effect rounded-xl p-6 card-hover border-2 border-pink-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-pink-900">Powerful Tools</h3>
              <p className="text-sm text-pink-700">
                Transform, filter, dedupe, and derive fields with ease
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="glass-effect rounded-2xl p-8 border-2 border-white/30 max-w-3xl mx-auto mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              How Does It Work?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white mb-1">Upload Your Files</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Start by uploading a template CSV file that defines your desired output structure, then upload one or more input CSV files you want to combine.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white mb-1">Provide Instructions</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Use the quick prompt or detailed instructions to describe what you want. The tool will help guide column mapping, transformations, and filtering based on your requirements.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white mb-1">Configure Settings</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Set up column mappings, apply data transformations, add filters, configure deduplication rules, and create derived fields using the intuitive configuration tabs.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white mb-1">Generate & Download</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Generate your report with a single click, preview the results, and download the final merged CSV file. All processing happens in your browser for privacy and speed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link href="/builder">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:via-pink-600 hover:to-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group animate-pulse-slow"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>Auto column mapping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>Data transforms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>Deduplication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span>Live preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


