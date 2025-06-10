"use client"

import { useState } from "react"
import PoliticiansList from "@/components/politicians-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PoliticiansPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">政治家データベース</h1>
        <p className="text-muted-foreground">
          衆議院・参議院・地方議員の情報を検索・参照できます。 会派、選挙区、当選回数などで絞り込みが可能です。
        </p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="house_of_representatives">衆議院</TabsTrigger>
          <TabsTrigger value="house_of_councillors">参議院</TabsTrigger>
          <TabsTrigger value="local">地方議会</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PoliticiansList defaultLegislature="all" />
        </TabsContent>
        <TabsContent value="house_of_representatives">
          <PoliticiansList defaultLegislature="house_of_representatives" />
        </TabsContent>
        <TabsContent value="house_of_councillors">
          <PoliticiansList defaultLegislature="house_of_councillors" />
        </TabsContent>
        <TabsContent value="local">
          <PoliticiansList defaultLegislature="local" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
