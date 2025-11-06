"use client";

import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import { useFeedbackStore } from "@/app/Store/useFeedbackStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CountMap = Record<string, number>;

function toCountMap(values: string[], allowed: string[]): CountMap {
  const normalizedAllowed = allowed.map((v) => v.toLowerCase());
  const counts: CountMap = Object.fromEntries(allowed.map((k) => [k, 0]));
  for (const raw of values) {
    const v = (raw || "").trim();
    const idx = normalizedAllowed.indexOf(v.toLowerCase());
    if (idx >= 0) counts[allowed[idx]] += 1;
  }
  return counts;
}

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function mapToPieData(
  map: CountMap,
  categories: string[]
): Array<{ name: string; value: number; fill: string }> {
  return categories.map((cat, i) => {
    const key = slugify(cat);
    return {
      name: cat,
      value: map[cat] || 0,
      fill: `var(--color-${key})`,
    };
  });
}

function PieCard({
  title,
  id,
  data,
  categories,
}: {
  title: string;
  id: string;
  data: Array<{ name: string; value: number; fill: string }>;
  categories: string[];
}) {
  const chartConfig: ChartConfig = categories.reduce((acc, cat, i) => {
    const key = slugify(cat);
    acc[key] = { label: cat, color: chartColors[i % chartColors.length] };
    return acc;
  }, {} as ChartConfig);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const activeData = data[activeIndex];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {categories.length > 1 && (
          <Select
            value={categories[activeIndex]}
            onValueChange={(value) => {
              const idx = categories.indexOf(value);
              if (idx >= 0) setActiveIndex(idx);
            }}
          >
            <SelectTrigger
              className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {categories.map((cat) => {
                const key = slugify(cat);
                const config = chartConfig[key];

                if (!config) {
                  return null;
                }

                return (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="rounded-lg [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-xs"
                        style={{
                          backgroundColor: `var(--color-${key})`,
                        }}
                      />
                      {config?.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              onMouseEnter={(_, index) => setActiveIndex(index ?? 0)}
              {...({
                activeIndex,
                activeShape: ({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                ),
              } as any)}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeData?.value.toLocaleString() ||
                            total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeData?.name || "Total"}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function NurseFeedbackPieCharts() {
  const {
    technicalFeedback,
    clinicWorkEnvironment,
    growthFeedback,
    initializeFromCSV,
  } = useFeedbackStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (
      technicalFeedback.length === 0 &&
      clinicWorkEnvironment.length === 0 &&
      growthFeedback.length === 0
    ) {
      console.log("[v0] No data in store, initializing from CSV");
      initializeFromCSV();
    }
    setIsLoaded(true);
  }, []);

  const charts = useMemo(() => {
    const yesNoCategories = ["Yes", "No"];
    const yesNoSometimesCategories = ["Yes", "No", "Sometimes"];
    const trainingCategories = ["Yes", "No", "Maybe later"];

    const tabletWorking = mapToPieData(
      toCountMap(
        technicalFeedback.map((t) => t.tabletWorking),
        yesNoCategories
      ),
      yesNoCategories
    );

    const internetProblems = mapToPieData(
      toCountMap(
        technicalFeedback.map((t) => t.internetProblems),
        yesNoSometimesCategories
      ),
      yesNoSometimesCategories
    );

    const getHelpQuickly = mapToPieData(
      toCountMap(
        technicalFeedback.map((t) => t.getHelpQuickly),
        yesNoSometimesCategories
      ),
      yesNoSometimesCategories
    );

    const doctorsRespectful = mapToPieData(
      toCountMap(
        technicalFeedback.map((t) => t.doctorsRespectful),
        yesNoCategories
      ),
      yesNoCategories
    );

    const comfortableTimings = mapToPieData(
      toCountMap(
        clinicWorkEnvironment.map((c) => c.comfortableTimings),
        yesNoCategories
      ),
      yesNoCategories
    );

    const cleanValues = clinicWorkEnvironment.map((c) => c.clinicClean);
    const safeValues = clinicWorkEnvironment.map((c) => c.feelSafe);
    const combined = cleanValues
      .map((v, i) => ({
        clean: (v || "").trim(),
        safe: (safeValues[i] || "").trim(),
      }))
      .map(({ clean, safe }) =>
        clean.toLowerCase() === "yes" && safe.toLowerCase() === "yes"
          ? "Yes"
          : "No"
      );
    const clinicCleanSafe = mapToPieData(
      toCountMap(combined, yesNoCategories),
      yesNoCategories
    );

    const proudOfWork = mapToPieData(
      toCountMap(
        growthFeedback.map((g) => g.proudOfWork),
        yesNoCategories
      ),
      yesNoCategories
    );

    const careerGrowth = mapToPieData(
      toCountMap(
        growthFeedback.map((g) => g.careerGrowth),
        yesNoCategories
      ),
      yesNoCategories
    );

    const trainingRequirement = mapToPieData(
      toCountMap(
        growthFeedback.map((g) => g.requireTraining),
        trainingCategories
      ),
      trainingCategories
    );

    const medicinesAvailability = mapToPieData(
      toCountMap(
        clinicWorkEnvironment.map((c) => c.medicinesAvailable),
        yesNoCategories
      ),
      yesNoCategories
    );

    const helpfulManagers = mapToPieData(
      toCountMap(
        clinicWorkEnvironment.map((c) => c.managersHelpful),
        yesNoCategories
      ),
      yesNoCategories
    );

    const patientTrust = mapToPieData(
      toCountMap(
        clinicWorkEnvironment.map((c) => c.patientsTrustYou),
        yesNoCategories
      ),
      yesNoCategories
    );

    return {
      tabletWorking,
      internetProblems,
      getHelpQuickly,
      doctorsRespectful,
      comfortableTimings,
      clinicCleanSafe,
      proudOfWork,
      careerGrowth,
      trainingRequirement,
      medicinesAvailability,
      helpfulManagers,
      patientTrust,
    };
  }, [technicalFeedback, clinicWorkEnvironment, growthFeedback]);

  if (
    !isLoaded ||
    (technicalFeedback.length === 0 &&
      clinicWorkEnvironment.length === 0 &&
      growthFeedback.length === 0)
  ) {
    return (
      <div className="space-y-10">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Tablet & Internet Performance
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PieCard
            id="tablet-working"
            title="Tablet Working Well"
            data={charts.tabletWorking}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="internet-problems"
            title="Internet Problems During Consultations"
            data={charts.internetProblems}
            categories={["Yes", "No", "Sometimes"]}
          />
          {/* <PieCard
            id="get-help-quickly"
            title="Get Help Quickly When Issues Arise"
            data={charts.getHelpQuickly}
            categories={["Yes", "No", "Sometimes"]}
          /> */}
          <PieCard
            id="doctors-respectful"
            title="Doctors' Behavior and Respect"
            data={charts.doctorsRespectful}
            categories={["Yes", "No"]}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Work Environment & Clinic Conditions
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PieCard
            id="comfortable-timings"
            title="Comfortable with Clinic Timings"
            data={charts.comfortableTimings}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="clinic-clean-safe"
            title="Clinic Clean & Safe"
            data={charts.clinicCleanSafe}
            categories={["Yes", "No"]}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Career Satisfaction & Growth
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PieCard
            id="proud-of-work"
            title="Proud of Work"
            data={charts.proudOfWork}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="career-growth"
            title="Career Growth"
            data={charts.careerGrowth}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="training-requirement"
            title="Training Requirement"
            data={charts.trainingRequirement}
            categories={["Yes", "No", "Maybe later"]}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Additional Insights</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PieCard
            id="medicines-availability"
            title="Medicines Availability"
            data={charts.medicinesAvailability}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="helpful-managers"
            title="Helpful Field Managers"
            data={charts.helpfulManagers}
            categories={["Yes", "No"]}
          />
          <PieCard
            id="patient-trust"
            title="Patient Trust and Behavior"
            data={charts.patientTrust}
            categories={["Yes", "No"]}
          />
        </div>
      </section>
    </div>
  );
}
