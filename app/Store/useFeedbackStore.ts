"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import Papa from "papaparse";
import { FEEDBACK_CSV_DATA } from "@/lib/feedback-data";

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
  initializeFromCSV: () => void;
}

function mapRowData(row: Record<string, string>) {
  return {
    technical: {
      id: Math.random().toString(36).substr(2, 9),
      name: row["Name and Employee ID"] || "",
      tabletWorking: row["Is the tablet working well for consultations?"] || "",
      internetProblems:
        row["Do you face internet problems during consultations?"] || "",
      knowHowToUseTablet: row["Do you know how to use the tablet?"] || "",
      getHelpQuickly:
        row["If tablet or internet has a problem do you get help quickly?"] ||
        "",
      doctorsRespectful:
        row["Are the doctors nice and respectful during consultations?"] || "",
    },
    clinic: {
      id: Math.random().toString(36).substr(2, 9),
      name: row["Name and Employee ID"] || "",
      partnerStaffIssues:
        row[
          "Do you face any problems working with the partner staff in the clinic?  "
        ] || "",
      comfortableTimings:
        row["Are you comfortable with the current clinic timings? "] || "",
      clinicClean: row["Is your clinic clean and in a good condition?"] || "",
      feelSafe: row["Do you feel safe working alone in the clinic?"] || "",
      medicinesAvailable:
        row["Do you get all the medicines you need at the clinic?"] || "",
      managersHelpful: row["Are your DCs and field managers helpful?"] || "",
      monthlyTargetCompleted:
        row["Are you able to complete your monthly target?"] || "",
      patientsBehaveWell: row["Do patients behave well with you?"] || "",
      patientsTrustYou: row["Do patients trust you at the clinic?"] || "",
      helpDuringCamps:
        row["Do you get help during health diagnostic camps?"] || "",
      equipmentWorking:
        row[
          "Are all the essential equipment in the clinic working properly?"
        ] || "",
    },
    growth: {
      id: Math.random().toString(36).substr(2, 9),
      name: row["Name and Employee ID"] || "",
      requireTraining: row["Do you require any additional training?"] || "",
      proudOfWork: row["Do you feel proud of your work?"] || "",
      careerGrowth:
        row[
          "Do you feel you can grow in your career while working at M-Swasth? "
        ] || "",
      friendRecommendation:
        row["Would you tell a friend to work here? (Rate from 1 to 10)"] || "",
      clinicDistance:
        row[
          "How far is the clinic from your residence? (in meters/ kilometers)"
        ] || "",
      additionalHelpNeeded:
        row["Any additional help you require to work better?"] || "",
      clinicImprovementSuggestions:
        row["Things that can make your clinic better"] || "",
      feedbackForManagement: row["Any feedback for the management"] || "",
    },
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

    initializeFromCSV: () => {
      try {
        console.log("[v0] Initializing data from embedded CSV");
        const result = Papa.parse(FEEDBACK_CSV_DATA, {
          header: true,
          skipEmptyLines: true,
        });
        const data = result.data as Record<string, string>[];

        console.log("[v0] Parsed embedded CSV with", data.length, "rows");

        const technicalRecords: TechnicalFeedback[] = [];
        const clinicRecords: ClinicWorkEnvironment[] = [];
        const growthRecords: GrowthFeedback[] = [];

        data.forEach((row) => {
          if (
            row["Name and Employee ID"] &&
            row["Name and Employee ID"].trim()
          ) {
            const mapped = mapRowData(row);
            technicalRecords.push(mapped.technical);
            clinicRecords.push(mapped.clinic);
            growthRecords.push(mapped.growth);
          }
        });

        set({
          technicalFeedback: technicalRecords,
          clinicWorkEnvironment: clinicRecords,
          growthFeedback: growthRecords,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "technical_feedback",
            JSON.stringify(technicalRecords)
          );
          localStorage.setItem(
            "clinic_work_environment",
            JSON.stringify(clinicRecords)
          );
          localStorage.setItem(
            "growth_feedback",
            JSON.stringify(growthRecords)
          );
        }

        console.log(
          "[v0] Initialized - Technical:",
          technicalRecords.length,
          "Clinic:",
          clinicRecords.length,
          "Growth:",
          growthRecords.length
        );
      } catch (error) {
        console.error("Error initializing from CSV:", error);
      }
    },

    fetchAllFeedback: () => {
      try {
        console.log("[v0] Fetching feedback from localStorage");
        if (typeof window !== "undefined") {
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
        }
      } catch (error) {
        console.error("Error fetching feedback from localStorage:", error);
      }
    },

    clearFeedbackCollections: () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("technical_feedback");
          localStorage.removeItem("clinic_work_environment");
          localStorage.removeItem("growth_feedback");
        }

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
