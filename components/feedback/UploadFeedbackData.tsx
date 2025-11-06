"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useFeedbackStore,
  type TechnicalFeedback,
  type ClinicWorkEnvironment,
  type GrowthFeedback,
} from "@/app/Store/useFeedbackStore";
import Papa from "papaparse";

export default function UploadFeedbackData() {
  const {
    selectedFiles,
    processedFiles,
    addSelectedFiles,
    removeSelectedFile,
    setProcessedFiles,
    clearSelectedFiles,
    fetchAllFeedback,
    clearFeedbackCollections,
  } = useFeedbackStore();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setDotCount((prev) => (prev % 3) + 1);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addSelectedFiles(files);
    }
  };

  const mapRowData = (row: Record<string, string>) => {
    return {
      technical: {
        id: Math.random().toString(36).substr(2, 9),
        name: row["Name and Employee ID"] || "",
        tabletWorking:
          row["Is the tablet working well for consultations?"] || "",
        internetProblems:
          row["Do you face internet problems during consultations?"] || "",
        knowHowToUseTablet: row["Do you know how to use the tablet?"] || "",
        getHelpQuickly:
          row[
            "If tablet or internet has a problem, do you get help quickly?"
          ] || "",
        doctorsRespectful:
          row["Are the doctors nice and respectful during consultations?"] ||
          "",
      } as TechnicalFeedback,
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
      } as ClinicWorkEnvironment,
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
          row["Would you tell a friend to work here? (Rate from 1 to 10)"] ||
          "",
        clinicDistance:
          row[
            "How far is the clinic from your residence? (in meters/ kilometers)"
          ] || "",
        additionalHelpNeeded:
          row["Any additional help you require to work better?"] || "",
        clinicImprovementSuggestions:
          row["Things that can make your clinic better"] || "",
        feedbackForManagement: row["Any feedback for the management"] || "",
      } as GrowthFeedback,
    };
  };

  const handleProcessFile = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    if (!confirm("Uploading new CSV will delete existing data. Continue?")) {
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    clearFeedbackCollections();
    const processed: { name: string; records: number }[] = [];

    try {
      for (const file of selectedFiles) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const data = result.data as Record<string, string>[];

        console.log("[v0] Parsed CSV with", data.length, "rows");
        console.log("[v0] CSV headers:", Object.keys(data[0] || {}));

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

        // Save to localStorage
        const existingTechnical = JSON.parse(
          localStorage.getItem("technical_feedback") || "[]"
        );
        const existingClinic = JSON.parse(
          localStorage.getItem("clinic_work_environment") || "[]"
        );
        const existingGrowth = JSON.parse(
          localStorage.getItem("growth_feedback") || "[]"
        );

        localStorage.setItem(
          "technical_feedback",
          JSON.stringify([...existingTechnical, ...technicalRecords])
        );
        localStorage.setItem(
          "clinic_work_environment",
          JSON.stringify([...existingClinic, ...clinicRecords])
        );
        localStorage.setItem(
          "growth_feedback",
          JSON.stringify([...existingGrowth, ...growthRecords])
        );

        console.log(
          "[v0] Saved records - Technical:",
          technicalRecords.length,
          "Clinic:",
          clinicRecords.length,
          "Growth:",
          growthRecords.length
        );

        processed.push({ name: file.name, records: technicalRecords.length });
        setUploadProgress((processed.length / selectedFiles.length) * 100);
      }

      setProcessedFiles(processed);
      fetchAllFeedback();
      clearSelectedFiles();
    } catch (error) {
      console.error("Error processing files:", error);
    }

    setIsLoading(false);
    setUploadProgress(100);
  };

  if (isLoading) {
    return (
      <Card className="w-full mx-auto border-dashed border-2 mb-10">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            Processing Files{".".repeat(dotCount)}
          </h2>
          <p className="text-muted-foreground">
            Please wait while your CSV files are being processed and uploaded.
          </p>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {Math.round(uploadProgress)}% Complete
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto border-dashed border-2 mb-10">
      <CardContent className="p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary">
            Upload Feedback Data
          </h2>
          <p className="text-muted-foreground">
            Upload the Nurse Feedback CSV file containing all feedback
            responses.
          </p>
        </div>
        <div className="space-y-4">
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Selected Files:
              </h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-success-100 text-foreground hover:bg-success-200 px-4 py-2 text-sm font-medium rounded-full"
                  >
                    {file.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                    className="text-destructive hover:text-destructive-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex md:flex-row flex-col items-center justify-center gap-4">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="bg-success-100 border-success-300 text-success hover:bg-success-800">
                Add CSV File
              </Button>
            </div>
            <Button
              onClick={handleProcessFile}
              disabled={selectedFiles.length === 0 || isLoading}
              className="bg-primary-400 hover:bg-primary-200 text-foreground px-6 py-2 rounded-lg"
            >
              Process {selectedFiles.length} CSV File
              {selectedFiles.length !== 1 ? "s" : ""}
            </Button>
          </div>
          {processedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Processing Results:
              </h3>
              {processedFiles.map((file, index) => (
                <p key={index} className="text-success font-medium">
                  {file.name}: Loaded {file.records} feedback records.
                </p>
              ))}
            </div>
          )}
        </div>
        {selectedFiles.length === 0 && processedFiles.length === 0 && (
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 hover:border-muted-foreground transition-colors cursor-pointer">
              <p className="text-muted-foreground">
                Click to select CSV files or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can select multiple files at once
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
