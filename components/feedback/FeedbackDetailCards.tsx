"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp } from "lucide-react";
import { useFeedbackStore } from "@/app/Store/useFeedbackStore";

function FeedbackDetailCards() {
  const technicalFeedback = useFeedbackStore(
    (state) => state.technicalFeedback
  );
  const clinicWorkEnvironment = useFeedbackStore(
    (state) => state.clinicWorkEnvironment
  );
  const growthFeedback = useFeedbackStore((state) => state.growthFeedback);
  const fetchAllFeedback = useFeedbackStore((state) => state.fetchAllFeedback);

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  const dashboardData = [
    {
      id: 1,
      title: "Technical Feedback",
      value: technicalFeedback.length,
      icon: <BarChart3 strokeWidth={2} />,
      color: "#6fff00",
    },
    {
      id: 2,
      title: "Clinic & Work Environment",
      value: clinicWorkEnvironment.length,
      icon: <Users strokeWidth={2} />,
      color: "#f003e0",
    },
    {
      id: 3,
      title: "Growth & Feedback",
      value: growthFeedback.length,
      icon: <TrendingUp strokeWidth={2} />,
      color: "#dc0e0e",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-10">
      {dashboardData.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-center">
                <h5
                  className="inline-block mb-4 p-6 rounded-full bg-background border"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </h5>
              </div>
              <h3>{item.title}</h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h1>{item.value}</h1>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default FeedbackDetailCards;
