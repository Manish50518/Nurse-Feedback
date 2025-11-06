"use client";

import {
  useFeedbackStore,
  type GrowthFeedback,
} from "@/app/Store/useFeedbackStore";
import { useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";

export default function GrowthFeedbackTable() {
  const { growthFeedback, fetchAllFeedback } = useFeedbackStore();

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  const columns: ColumnDef<GrowthFeedback>[] = [
    {
      accessorKey: "name",
      header: "Name",
      id: "name",
    },
    {
      accessorKey: "requireTraining",
      header: "Require Training",
      id: "requireTraining",
    },
    {
      accessorKey: "proudOfWork",
      header: "Proud of Work",
      id: "proudOfWork",
    },
    {
      accessorKey: "careerGrowth",
      header: "Career Growth",
      id: "careerGrowth",
    },
    {
      accessorKey: "friendRecommendation",
      header: "Friend Recommendation",
      id: "friendRecommendation",
    },
    {
      accessorKey: "clinicDistance",
      header: "Clinic Distance",
      id: "clinicDistance",
    },
    {
      accessorKey: "additionalHelpNeeded",
      header: "Additional Help Needed",
      id: "additionalHelpNeeded",
    },
    {
      accessorKey: "clinicImprovementSuggestions",
      header: "Clinic Improvement Suggestions",
      id: "clinicImprovementSuggestions",
    },
    {
      accessorKey: "feedbackForManagement",
      header: "Feedback for Management",
      id: "feedbackForManagement",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={growthFeedback}
      title="Growth & Feedback"
      initialPageSize={10}
    />
  );
}
