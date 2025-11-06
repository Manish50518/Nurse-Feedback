"use client";

import { useEffect } from "react";

import { useFeedbackStore } from "@/app/Store/useFeedbackStore";
import FeedbackDetailCards from "@/components/feedback/FeedbackDetailCards";
import TechnicalFeedbackTable from "@/components/feedback/TechnicalFeedbackTable";
import ClinicWorkEnvironmentTable from "@/components/feedback/ClinicWorkEnvironmentTable";
import GrowthFeedbackTable from "@/components/feedback/GrowthFeedbackTable";
import NurseFeedbackPieCharts from "@/components/feedback/NurseFeedbackPieCharts";

export default function Page() {
  const { initializeFromCSV } = useFeedbackStore();

  useEffect(() => {
    initializeFromCSV();
  }, [initializeFromCSV]);

  return (
    <main className="container mx-auto py-10 px-7 ">
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Nurse Feedback Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze nurse feedback data across three categories
          </p>
        </div>

        <FeedbackDetailCards />

        <NurseFeedbackPieCharts />

        <div className="space-y-12">
          <TechnicalFeedbackTable />
          <ClinicWorkEnvironmentTable />
          <GrowthFeedbackTable />
        </div>
      </div>
    </main>
  );
}
