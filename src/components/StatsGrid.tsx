/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileText, Map, Trash2, Percent, CheckCircle2 } from "lucide-react";
import { StatsSummary } from "../types";

interface StatsGridProps {
  stats: StatsSummary;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const percentRecovered = stats.totalProjectArea > 0 
    ? (stats.totalRecoveredArea / stats.totalProjectArea) * 100 
    : 0;

  const cards = [
    {
      id: "stats-projects",
      title: "Tổng số dự án",
      value: stats.totalProjects.toLocaleString("en-US"),
      subtext: `${stats.fullyRecoveredCount.toLocaleString("en-US")} dự án thu hồi 100%`,
      icon: <FileText className="w-5 h-5 text-[#9f224e]" />,
      bg: "bg-white border-gray-150 border-l-4 border-l-[#9f224e]",
      iconBg: "bg-red-50/70"
    },
    {
      id: "stats-project-area",
      title: "Tổng diện tích quy hoạch",
      value: `${stats.totalProjectArea.toLocaleString("en-US", { maximumFractionDigits: 2 })} ha`,
      subtext: "",
      icon: <Map className="w-5 h-5 text-gray-700" />,
      bg: "bg-white border-gray-150 border-l-4 border-l-gray-400",
      iconBg: "bg-gray-100/70"
    },
    {
      id: "stats-recovered-area",
      title: "Diện tích bị thu hồi",
      value: `${stats.totalRecoveredArea.toLocaleString("en-US", { maximumFractionDigits: 2 })} ha`,
      subtext: `Chiếm ${percentRecovered.toFixed(1)}% tổng diện tích quy hoạch`,
      icon: <Trash2 className="w-5 h-5 text-amber-700" />,
      bg: "bg-white border-gray-150 border-l-4 border-l-amber-500",
      iconBg: "bg-amber-50/70"
    },
    {
      id: "stats-ratio",
      title: "Tỉ lệ thu hồi trung bình mỗi dự án",
      value: `${stats.avgRecoveryRatio.toFixed(1)}%`,
      subtext: "",
      icon: <Percent className="w-5 h-5 text-[#9f224e]" />,
      bg: "bg-white border-gray-150 border-l-4 border-l-[#9f224e]/60",
      iconBg: "bg-red-50/70"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {cards.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className={`p-2.5 sm:p-3.5 rounded-xl border transition-all duration-300 hover:shadow-md hover:translate-y-[-1px] ${card.bg}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 leading-tight break-words">
                {card.title}
              </p>
              <h3 className="text-sm sm:text-lg font-extrabold text-gray-950 mt-1 font-mono tracking-tight leading-none whitespace-nowrap">
                {card.value}
              </h3>
              {card.subtext && (
                <p className="hidden sm:flex text-[11px] text-gray-500 mt-1.5 items-center gap-1 font-sans truncate" title={card.subtext}>
                  {card.subtext}
                </p>
              )}
            </div>
            <div className={`p-1.5 sm:p-2 rounded-lg ${card.iconBg} shrink-0`}>
              <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center">
                {React.cloneElement(card.icon as React.ReactElement, { className: "w-full h-full" })}
              </div>
            </div>
          </div>
          {card.id === "stats-recovered-area" && (
            <div className="hidden sm:block w-full bg-gray-200/60 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#9f224e] h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, percentRecovered)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
