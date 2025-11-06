"use client";

import { useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import type { ClinicWorkEnvironment } from "@/app/Store/useFeedbackStore";
import { useFeedbackStore } from "@/app/Store/useFeedbackStore";

export default function ClinicWorkEnvironmentTable() {
  const { clinicWorkEnvironment, fetchAllFeedback } = useFeedbackStore();

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  const columns: ColumnDef<ClinicWorkEnvironment>[] = [
    {
      accessorKey: "name",
      header: "Name",
      id: "name",
    },
    {
      accessorKey: "partnerStaffIssues",
      header: "Partner Staff Issues",
      id: "partnerStaffIssues",
    },
    {
      accessorKey: "comfortableTimings",
      header: "Comfortable Timings",
      id: "comfortableTimings",
    },
    {
      accessorKey: "clinicClean",
      header: "Clinic Clean",
      id: "clinicClean",
    },
    {
      accessorKey: "feelSafe",
      header: "Feel Safe",
      id: "feelSafe",
    },
    {
      accessorKey: "medicinesAvailable",
      header: "Medicines Available",
      id: "medicinesAvailable",
    },
    {
      accessorKey: "managersHelpful",
      header: "Managers Helpful",
      id: "managersHelpful",
    },
    {
      accessorKey: "monthlyTargetCompleted",
      header: "Monthly Target Completed",
      id: "monthlyTargetCompleted",
    },
    {
      accessorKey: "patientsBehaveWell",
      header: "Patients Behave Well",
      id: "patientsBehaveWell",
    },
    {
      accessorKey: "patientsTrustYou",
      header: "Patients Trust You",
      id: "patientsTrustYou",
    },
    {
      accessorKey: "helpDuringCamps",
      header: "Help During Camps",
      id: "helpDuringCamps",
    },
    {
      accessorKey: "equipmentWorking",
      header: "Equipment Working",
      id: "equipmentWorking",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clinicWorkEnvironment}
      title="Clinic & Work Environment Feedback"
      initialPageSize={10}
    />
  );
}
