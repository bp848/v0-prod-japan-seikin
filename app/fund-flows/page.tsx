"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AIChat from "@/components/ai-chat"
import FundFlowVisualizer from "@/components/fund-flow-visualizer"

export default function FundFlowsPage() {
  const [visualizationParams, setVisualizationParams] = useState(null)
  const [flowData, setFlowData] = useState([])

  // AIチャットからの可視化パラメータ更新
  const handleVisualizationUpdate = (params, data) => {
    setVisualizationParams(params)
    setFlowData(data)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">政治資金フロー分析</h1>

      <Tabs defaultValue="split" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="split">分割表示</TabsTrigger>
          <TabsTrigger value="chat">チャット</TabsTrigger>
          <TabsTrigger value="visualizer">可視化</TabsTrigger>
        </TabsList>

        <TabsContent value="split" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
            <AIChat onVisualizationUpdate={handleVisualizationUpdate} />
            <FundFlowVisualizer initialParams={visualizationParams} initialData={flowData} />
          </div>
        </TabsContent>

        <TabsContent value="chat" className="w-full">
          <div className="h-[calc(100vh-220px)]">
            <AIChat onVisualizationUpdate={handleVisualizationUpdate} />
          </div>
        </TabsContent>

        <TabsContent value="visualizer" className="w-full">
          <div className="h-[calc(100vh-220px)]">
            <FundFlowVisualizer initialParams={visualizationParams} initialData={flowData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
