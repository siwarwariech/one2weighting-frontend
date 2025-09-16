/* src/components/Stepper.tsx */
import React, { Fragment, useEffect, useState } from "react";
import clsx from "clsx";
import "./stepper.css";
import api from "@/services/api";

type StepNum = 1 | 2 | 3 | 4 | 5;

const steps: { n: StepNum; label: string }[] = [
  { n: 1, label: "Select File" },
  { n: 2, label: "Select Variables" },
  { n: 3, label: "Set Targets" },
  { n: 4, label: "Weighting" },
  { n: 5, label: "Report" },
];

interface StepperProps {
  current: StepNum;
  projectId?: string; // Optional project ID for progress tracking
}

export default function Stepper({ current, projectId }: StepperProps) {
  const [completedSteps, setCompletedSteps] = useState<StepNum[]>([]);

  // Fetch project progress if projectId is provided
  useEffect(() => {
    if (projectId) {
      api.get(`/api/projects/${projectId}/progress`)
        .then(response => {
          setCompletedSteps(response.data.completed_steps || []);
        })
        .catch(() => {
          // Fallback to local current step if API fails
          setCompletedSteps(Array.from({length: current - 1}, (_, i) => (i + 1) as StepNum));
        });
    } else {
      // For non-project contexts, just use the current prop
      setCompletedSteps(Array.from({length: current - 1}, (_, i) => (i + 1) as StepNum));
    }
  }, [current, projectId]);

  return (
    <ol className="stepper">
      {steps.map(({ n, label }, i) => {
        const done = completedSteps.includes(n);
        const active = n === current;

        return (
          <Fragment key={n}>
            {/* pastille + label */}
            <li
              className={clsx(
                "step",
                done && "step--done",
                active && "step--active"
              )}
            >
              <span className="step__ball">{done ? "✓" : n}</span>
              <span className="step__label">{label}</span>
            </li>

            {/* trait sauf après le dernier élément */}
            {i < steps.length - 1 && (
              <span
                className={clsx(
                  "step__line",
                  done && "bg-green-600"
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}