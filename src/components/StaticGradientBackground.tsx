
const StaticGradientBackground = () => {
  return (
    <div className="absolute inset-0 w-full min-h-full">
      {/* Navy section at top */}
      <div className="w-full h-32 bg-slate-900" />
      
      {/* Circular gradient section */}
      <div 
        className="w-full"
        style={{
          height: 'calc(100vh + 100vh)',
          background: `radial-gradient(circle at 50% 30%, 
            rgb(15, 23, 42) 0%,     /* Navy center */
            rgb(88, 28, 135) 25%,   /* Purple */
            rgb(190, 24, 93) 40%,   /* Less bright pink */
            rgb(88, 28, 135) 60%,   /* Purple */
            rgb(15, 23, 42) 80%     /* Navy outer */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
