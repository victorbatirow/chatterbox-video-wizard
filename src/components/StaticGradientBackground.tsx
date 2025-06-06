
const StaticGradientBackground = () => {
  return (
    <div className="absolute inset-0 w-full min-h-full">
      {/* Solid navy section at top - reduced by half */}
      <div className="w-full h-16 bg-slate-900" />
      
      {/* Circular gradient section positioned lower */}
      <div 
        className="w-full"
        style={{
          height: 'calc(100vh + 100vh)', // Make it tall enough for scrolling
          background: `radial-gradient(circle at center 30%, 
            rgb(219, 39, 119) 0%,     /* Pink center */
            rgb(88, 28, 135) 50%,     /* Purple */
            rgb(15, 23, 42) 85%       /* Navy outer */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
