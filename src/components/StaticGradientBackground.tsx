
const StaticGradientBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            rgb(15, 23, 42) 0%,     /* Navy */
            rgb(88, 28, 135) 25%,   /* Purple */
            rgb(190, 24, 93) 50%,   /* Less bright pink */
            rgb(88, 28, 135) 75%,   /* Purple (mirror) */
            rgb(15, 23, 42) 100%    /* Navy (mirror) */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
