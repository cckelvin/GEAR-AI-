import React from 'react';
import { Target, Users, Rocket, GraduationCap } from 'lucide-react';

export default function SolutionsPage() {
  const personas = [
    {
      icon: <Rocket className="w-5 h-5 text-white" />,
      audience: "SaaS & App Founders",
      goal: "Rapid Ideation & Testing",
      desc: "Instantly draft wireframes, visual mockups, and interactive landing pages. Bypass long development setups so you can capture validation, present to initial clients, or test different feature loops with zero friction."
    },
    {
      icon: <Users className="w-5 h-5 text-white" />,
      audience: "Freelancers & Agencies",
      goal: "Fast Draft Client Deliverables",
      desc: "Create bespoke template concepts block by block under custom branded labels. Speed up pitch deck creation or let clients explore draft code options using real live preview links before finalizing the contract."
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      audience: "Hackathons & Prototypes",
      goal: "High Velocity Development",
      desc: "Focus on the core USP. Gear Studio bootstraps files, dependencies, layout, styling, and basic serverless functionality instantaneously so you can test features and ship high fidelity scripts in hours rather than days."
    },
    {
      icon: <Target className="w-5 h-5 text-white" />,
      audience: "Indie Developers",
      goal: "Solo Productivity Booster",
      desc: "Automate repetitive boilerplates. Delegate standard setups, input validations, menu headers, dark modes, or script modules to your personalized AI assistant, liberating you to focus purely on complex business logic."
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black text-white relative">
      <div className="max-w-4xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-neutral-800">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Target Audiences</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Tailored Solutions</h1>
          <p className="text-neutral-400 text-xs max-w-lg mx-auto">
            Review how people from design, marketing, and software engineering use Gear Studio to fast-track their sandbox pipelines.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((p, idx) => (
            <div 
              key={idx}
              className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3 hover:border-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{p.audience}</h3>
                  <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block mt-0.5">{p.goal}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed pt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
