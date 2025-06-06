
import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div className={`container-home max-w-7xl mx-auto px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
