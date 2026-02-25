import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {children}
    </div>
  );
};

export default AppLayout;
