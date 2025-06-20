import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}