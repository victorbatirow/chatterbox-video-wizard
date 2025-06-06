
import { ReactNode } from "react";

interface LayeredBackgroundProps {
  children: ReactNode;
}

const LayeredBackground = ({ children }: LayeredBackgroundProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Dark base background to prevent white spaces */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900" />

      {/* Animated gradient background - much larger than viewport */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute -inset-[200%] animate-gradient-shift blur-3xl opacity-80"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.9) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.9) 0%, transparent 40%),
              radial-gradient(circle at 40% 70%, rgba(236, 72, 153, 0.9) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.9) 0%, transparent 40%),
              radial-gradient(circle at 10% 90%, rgba(79, 70, 229, 0.9) 0%, transparent 40%),
              radial-gradient(circle at 60% 10%, rgba(139, 92, 246, 0.8) 0%, transparent 40%),
              radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.8) 0%, transparent 40%)
            `
          }}
        />
      </div>

      {/* Additional animated layer for more vibrant colors */}
      <div className="absolute inset-0 -z-9">
        <div 
          className="absolute -inset-[150%] animate-gradient-shift-reverse blur-2xl opacity-60"
          style={{
            background: `
              radial-gradient(circle at 70% 40%, rgba(217, 70, 239, 0.8) 0%, transparent 35%),
              radial-gradient(circle at 30% 80%, rgba(99, 102, 241, 0.8) 0%, transparent 35%),
              radial-gradient(circle at 90% 30%, rgba(244, 114, 182, 0.8) 0%, transparent 35%),
              radial-gradient(circle at 10% 60%, rgba(129, 140, 248, 0.8) 0%, transparent 35%)
            `
          }}
        />
      </div>

      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 -z-5 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='17' cy='17' r='1'/%3E%3Ccircle cx='37' cy='17' r='1'/%3E%3Ccircle cx='57' cy='17' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='17' cy='37' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3Ccircle cx='57' cy='37' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3Ccircle cx='17' cy='57' r='1'/%3E%3Ccircle cx='37' cy='57' r='1'/%3E%3Ccircle cx='57' cy='57' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 -z-7 bg-black/20" />

      {/* Content with slide-up animation */}
      <div className="relative z-10 animate-slide-up">
        {children}
      </div>
    </div>
  );
};

export default LayeredBackground;
