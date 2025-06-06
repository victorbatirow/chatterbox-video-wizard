
const StaticGradientBackground = () => {
  return (
    <div className="absolute inset-0 w-full min-h-full">
      {/* Solid navy section at top */}
      <div className="w-full h-32 bg-slate-900" />
      
      {/* Mirrored gradient section */}
      <div 
        className="w-full"
        style={{
          height: 'calc(100vh + 100vh)', // Make it tall enough for scrolling
          background: `linear-gradient(to bottom, 
            rgb(15, 23, 42) 0%,     /* Navy */
            rgb(88, 28, 135) 25%,   /* Purple */
            rgb(219, 39, 119) 50%,  /* Pink */
            rgb(88, 28, 135) 75%,   /* Purple (mirror) */
            rgb(15, 23, 42) 100%    /* Navy (mirror) */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
