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
      value: stats.totalProjects.toLocaleString("vi-VN"),
      subtext: `${stats.fullyRecoveredCount.toLocaleString("vi-VN")} dự án thu hồi 100%`,
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50/50 border-emerald-100",
      iconBg: "bg-emerald-100/80"
    },
    {
      id: "stats-project-area",
      title: "Tổng diện tích quy hoạch",
      value: `${stats.totalProjectArea.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ha`,
      subtext: "Tổng diện tích đất của tất cả dự án",
      icon: <Map className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50/50 border-blue-100",
      iconBg: "bg-blue-100/80"
    },
    {
      id: "stats-recovered-area",
      title: "Diện tích bị thu hồi",
      value: `${stats.totalRecoveredArea.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ha`,
      subtext: `Chiếm ${percentRecovered.toFixed(1)}% tổng diện tích quy hoạch`,
      icon: <Trash2 className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50/50 border-amber-100",
      iconBg: "bg-amber-100/80"
    },
    {
      id: "stats-ratio",
      title: "Tỷ lệ thu hồi trung bình",
      value: `${stats.avgRecoveryRatio.toFixed(1)}%`,
      subtext: "Trung bình tỉ lệ thu hồi mỗi dự án",
      icon: <Percent className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50/50 border-indigo-100",
      iconBg: "bg-indigo-100/80"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] ${card.bg}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-950 mt-1 font-mono tracking-tight">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-sans">
                {card.id === "stats-projects" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />}
                {card.subtext}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          {card.id === "stats-recovered-area" && (
            <div className="w-full bg-gray-200/60 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, percentRecovered)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
