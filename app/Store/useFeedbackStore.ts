"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface TechnicalFeedback {
  id?: string;
  name: string;
  tabletWorking: string;
  internetProblems: string;
  knowHowToUseTablet: string;
  getHelpQuickly: string;
  doctorsRespectful: string;
}

export interface ClinicWorkEnvironment {
  id?: string;
  name: string;
  partnerStaffIssues: string;
  comfortableTimings: string;
  clinicClean: string;
  feelSafe: string;
  medicinesAvailable: string;
  managersHelpful: string;
  monthlyTargetCompleted: string;
  patientsBehaveWell: string;
  patientsTrustYou: string;
  helpDuringCamps: string;
  equipmentWorking: string;
}

export interface GrowthFeedback {
  id?: string;
  name: string;
  requireTraining: string;
  proudOfWork: string;
  careerGrowth: string;
  friendRecommendation: string;
  clinicDistance: string;
  additionalHelpNeeded: string;
  clinicImprovementSuggestions: string;
  feedbackForManagement: string;
}

interface FeedbackStore {
  selectedFiles: File[];
  processedFiles: { name: string; records: number }[];
  technicalFeedback: TechnicalFeedback[];
  clinicWorkEnvironment: ClinicWorkEnvironment[];
  growthFeedback: GrowthFeedback[];
  setSelectedFiles: (files: File[]) => void;
  addSelectedFiles: (files: File[]) => void;
  removeSelectedFile: (index: number) => void;
  setProcessedFiles: (files: { name: string; records: number }[]) => void;
  clearSelectedFiles: () => void;
  fetchAllFeedback: () => void;
  clearFeedbackCollections: () => void;
  getDashboardData: () => {
    totalTechnicalRecords: number;
    totalClinicRecords: number;
    totalGrowthRecords: number;
    totalRecords: number;
  };
}

export const useFeedbackStore = create<FeedbackStore>()(
  devtools((set, get) => ({
    selectedFiles: [],
    processedFiles: [],
    technicalFeedback: [],
    clinicWorkEnvironment: [],
    growthFeedback: [],

    setSelectedFiles: (files) => set({ selectedFiles: files }),
    addSelectedFiles: (files) =>
      set((state) => ({ selectedFiles: [...state.selectedFiles, ...files] })),
    removeSelectedFile: (index) =>
      set((state) => ({
        selectedFiles: state.selectedFiles.filter((_, i) => i !== index),
      })),
    setProcessedFiles: (files) => set({ processedFiles: files }),
    clearSelectedFiles: () => set({ selectedFiles: [] }),

    fetchAllFeedback: () => {
      try {
        console.log("[v0] Fetching feedback from localStorage");
        const technical = JSON.parse(
          localStorage.getItem("technical_feedback") || "[]"
        );
        const clinic = JSON.parse(
          localStorage.getItem("clinic_work_environment") || "[]"
        );
        const growth = JSON.parse(
          localStorage.getItem("growth_feedback") || "[]"
        );

        console.log(
          "[v0] Loaded data - Technical:",
          technical.length,
          "Clinic:",
          clinic.length,
          "Growth:",
          growth.length
        );

        set({
          technicalFeedback: technical,
          clinicWorkEnvironment: clinic,
          growthFeedback: growth,
        });
      } catch (error) {
        console.error("Error fetching feedback from localStorage:", error);
      }
    },

    clearFeedbackCollections: () => {
      try {
        localStorage.removeItem("technical_feedback");
        localStorage.removeItem("clinic_work_environment");
        localStorage.removeItem("growth_feedback");

        set({
          technicalFeedback: [],
          clinicWorkEnvironment: [],
          growthFeedback: [],
        });
      } catch (error) {
        console.error("Error clearing feedback from localStorage:", error);
      }
    },

    getDashboardData: () => {
      const { technicalFeedback, clinicWorkEnvironment, growthFeedback } =
        get();
      return {
        totalTechnicalRecords: technicalFeedback.length,
        totalClinicRecords: clinicWorkEnvironment.length,
        totalGrowthRecords: growthFeedback.length,
        totalRecords:
          technicalFeedback.length +
          clinicWorkEnvironment.length +
          growthFeedback.length,
      };
    },
  }))
);
