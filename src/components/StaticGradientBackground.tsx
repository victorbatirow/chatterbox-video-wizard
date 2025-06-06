
const StaticGradientBackground = () => {
  return (
    <div className="absolute inset-0 w-full min-h-full">
      {/* Solid navy section at top */}
      <div className="w-full h-32 bg-slate-900" />
      
      {/* Mirrored gradient section with darker colors and more gradual transitions */}
      <div 
        className="w-full"
        style={{
          height: 'calc(200vh)', // Taller for more gradual transitions
          background: `linear-gradient(to bottom, 
            rgb(15, 23, 42) 0%,      /* Navy */
            rgb(15, 23, 42) 10%,     /* Navy extended */
            rgb(55, 48, 163) 30%,    /* Deep indigo/royal purple */
            rgb(136, 19, 55) 50%,    /* Dark magenta/burgundy */
            rgb(55, 48, 163) 70%,    /* Deep indigo/royal purple (mirror) */
            rgb(15, 23, 42) 90%,     /* Navy (mirror) */
            rgb(15, 23, 42) 100%     /* Navy extended to end */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
