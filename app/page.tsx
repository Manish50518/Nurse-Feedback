"use client";

import UploadFeedbackData from "@/components/feedback/UploadFeedbackData";
import FeedbackDetailCards from "@/components/feedback/FeedbackDetailCards";
import ClinicWorkEnvironmentTable from "@/components/feedback/ClinicWorkEnvironmentTable";
import GrowthFeedbackTable from "@/components/feedback/GrowthFeedbackTable";
import TechnicalFeedbackTable from "@/components/feedback/TechnicalFeedbackTable";

export default function Page() {
  return (
    <main className="container mx-auto py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Nurse Feedback Dashboard</h1>
          <p className="text-muted-foreground">
            Upload and manage nurse feedback data across three categories
          </p>
        </div>

        <UploadFeedbackData />

        <FeedbackDetailCards />

        <div className="space-y-12">
          <TechnicalFeedbackTable />
          <ClinicWorkEnvironmentTable />
          <GrowthFeedbackTable />
        </div>
      </div>
    </main>
  );
}
