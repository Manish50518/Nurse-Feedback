"use client";

import { useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import {
  TechnicalFeedback,
  useFeedbackStore,
} from "@/app/Store/useFeedbackStore";

export default function TechnicalFeedbackTable() {
  const { technicalFeedback, fetchAllFeedback } = useFeedbackStore();

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  const columns: ColumnDef<TechnicalFeedback>[] = [
    {
      accessorKey: "name",
      header: "Name",
      id: "name",
    },
    {
      accessorKey: "tabletWorking",
      header: "Tablet Working",
      id: "tabletWorking",
    },
    {
      accessorKey: "internetProblems",
      header: "Internet Problems",
      id: "internetProblems",
    },
    {
      accessorKey: "knowHowToUseTablet",
      header: "Know How to Use Tablet",
      id: "knowHowToUseTablet",
    },
    {
      accessorKey: "getHelpQuickly",
      header: "Get Help Quickly",
      id: "getHelpQuickly",
    },
    {
      accessorKey: "doctorsRespectful",
      header: "Doctors Respectful",
      id: "doctorsRespectful",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={technicalFeedback}
      title="Technical Feedback"
      initialPageSize={10}
    />
  );
}
