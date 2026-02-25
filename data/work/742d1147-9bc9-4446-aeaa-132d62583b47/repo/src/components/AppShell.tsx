import { ReactNode } from "react";

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 md:py-8">
      <div className="w-full min-h-screen md:min-h-0 md:w-[390px] md:h-[812px] md:rounded-2xl md:shadow-xl md:border md:border-border bg-background relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default AppShell;
