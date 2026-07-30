"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./components/ProfileTab";
import { CurriculumTab } from "./components/CurriculumTab";
import { SurveysTab } from "./components/SurveysTab";

export default function PortfolioDashboardPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfólio Institucional</h1>
        <p className="text-muted-foreground">
          Gerencie o conteúdo do seu site acadêmico/profissional (público).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 h-auto md:h-12 gap-1 mb-8">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="curriculum">Currículo</TabsTrigger>
          <TabsTrigger value="surveys">Pesquisas</TabsTrigger>
        </TabsList>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm min-h-[500px]">
          <TabsContent value="profile" className="m-0 focus-visible:outline-none">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="curriculum" className="m-0 focus-visible:outline-none">
            <CurriculumTab />
          </TabsContent>
          
          <TabsContent value="surveys" className="m-0 focus-visible:outline-none">
            <SurveysTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
