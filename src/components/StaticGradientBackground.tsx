
const StaticGradientBackground = () => {
  return (
    <div className="absolute inset-0 w-full min-h-full">
      {/* Solid navy section at top */}
      <div className="w-full h-36 bg-slate-900" />
      
      {/* Mirrored gradient section with darker colors */}
      <div 
        className="w-full"
        style={{
          height: '150vh', // Shorter height for quicker transitions
          background: `linear-gradient(to bottom, 
            rgb(15, 23, 42) 0%,      /* Navy start */
            rgb(15, 23, 42) 5%,      /* Navy hold */
            rgb(67, 56, 102) 20%,    /* Deep indigo/purple */
            rgb(88, 28, 135) 35%,    /* Royal purple */
            rgb(126, 34, 95) 50%,    /* Dark magenta */
            rgb(88, 28, 135) 65%,    /* Royal purple (mirror) */
            rgb(67, 56, 102) 80%,    /* Deep indigo/purple (mirror) */
            rgb(15, 23, 42) 95%,     /* Navy end */
            rgb(15, 23, 42) 100%     /* Navy hold at bottom */
          )`
        }}
      />
    </div>
  );
};

export default StaticGradientBackground;
