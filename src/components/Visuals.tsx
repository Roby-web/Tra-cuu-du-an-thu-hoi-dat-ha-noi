/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Project } from "../types";
import { BarChart3, PieChart, Landmark, Layers } from "lucide-react";

interface VisualsProps {
  projects: Project[];
}

const COLOR_MAP: { [key: string]: string } = {
  "bg-emerald-500": "#9f224e",
  "bg-indigo-500": "#c2416c",
  "bg-amber-500": "#cca150",
  "bg-rose-500": "#7c828c",
};

export const Visuals: React.FC<VisualsProps> = ({ projects }) => {
  // 1. Top 8 Wards by Recovered Area
  const topWards = useMemo(() => {
    const wardMap: { [key: string]: { projectArea: number; recoveredArea: number; count: number } } = {};
    
    projects.forEach((p) => {
      if (!p.xaPhuong) return;
      if (!wardMap[p.xaPhuong]) {
        wardMap[p.xaPhuong] = { projectArea: 0, recoveredArea: 0, count: 0 };
      }
      wardMap[p.xaPhuong].projectArea += p.dienTichDa;
      wardMap[p.xaPhuong].recoveredArea += p.dienTichTh;
      wardMap[p.xaPhuong].count += 1;
    });

    return Object.entries(wardMap)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.recoveredArea - a.recoveredArea)
      .slice(0, 8);
  }, [projects]);

  // 2. Recovered Area by Land-Use Purpose (Top 6 + Others)
  const purposeStats = useMemo(() => {
    const purposeMap: { [key: string]: { projectArea: number; recoveredArea: number; count: number } } = {};
    
    projects.forEach((p) => {
      const purpose = p.mucDich || "Chưa xác định";
      if (!purposeMap[purpose]) {
        purposeMap[purpose] = { projectArea: 0, recoveredArea: 0, count: 0 };
      }
      purposeMap[purpose].projectArea += p.dienTichDa;
      purposeMap[purpose].recoveredArea += p.dienTichTh;
      purposeMap[purpose].count += 1;
    });

    const sortedPurposes = Object.entries(purposeMap)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.recoveredArea - a.recoveredArea);

    if (sortedPurposes.length <= 6) return sortedPurposes;

    const top6 = sortedPurposes.slice(0, 5);
    const others = sortedPurposes.slice(5).reduce(
      (acc, curr) => {
        acc.projectArea += curr.projectArea;
        acc.recoveredArea += curr.recoveredArea;
        acc.count += curr.count;
        return acc;
      },
      { name: "Khác", projectArea: 0, recoveredArea: 0, count: 0 }
    );

    return [...top6, others];
  }, [projects]);

  // 3. Classification Distribution
  const classificationStats = useMemo(() => {
    const classMap: { [key: string]: { projectArea: number; recoveredArea: number; count: number } } = {};
    
    projects.forEach((p) => {
      const cls = p.phanLoai || "Chưa xác định";
      if (!classMap[cls]) {
        classMap[cls] = { projectArea: 0, recoveredArea: 0, count: 0 };
      }
      classMap[cls].projectArea += p.dienTichDa;
      classMap[cls].recoveredArea += p.dienTichTh;
      classMap[cls].count += 1;
    });

    const totalRecovered = projects.reduce((sum, p) => sum + p.dienTichTh, 0);

    return Object.entries(classMap).map(([name, data]) => ({
      name,
      ...data,
      percentage: totalRecovered > 0 ? (data.recoveredArea / totalRecovered) * 100 : 0
    })).sort((a, b) => b.recoveredArea - a.recoveredArea);
  }, [projects]);

  // 4. Recovery Ratios Buckets (0-20%, 20-50%, 50-99%, 100%)
  const ratioBuckets = useMemo(() => {
    let b100 = 0; // 100%
    let b50_99 = 0; // 50% to <100%
    let b20_50 = 0; // 20% to <50%
    let b0_20 = 0; // <20%

    projects.forEach((p) => {
      if (p.dienTichDa <= 0) {
        if (p.dienTichTh > 0) b100++;
        return;
      }
      const ratio = (p.dienTichTh / p.dienTichDa) * 100;
      if (ratio >= 99.9) b100++;
      else if (ratio >= 50) b50_99++;
      else if (ratio >= 20) b20_50++;
      else b0_20++;
    });

    const total = projects.length || 1;
    return [
      { name: "Thu hồi toàn bộ (100%)", count: b100, color: "bg-emerald-500", percentage: (b100 / total) * 100 },
      { name: "Thu hồi đa số (50% - 99%)", count: b50_99, color: "bg-indigo-500", percentage: (b50_99 / total) * 100 },
      { name: "Thu hồi một phần (20% - 49%)", count: b20_50, color: "bg-amber-500", percentage: (b20_50 / total) * 100 },
      { name: "Thu hồi ít (Dưới 20%)", count: b0_20, color: "bg-rose-500", percentage: (b0_20 / total) * 100 },
    ];
  }, [projects]);

  // Calculate max recovered area values for visual scaling
  const maxWardArea = Math.max(...topWards.map(w => w.recoveredArea), 1);
  const maxPurposeArea = Math.max(...purposeStats.map(p => p.recoveredArea), 1);

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-8 text-center text-gray-400 font-sans shadow-sm">
        Không có đủ dữ liệu để tạo biểu đồ phân tích.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Top Wards Column */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-red-50 rounded-lg text-[#9f224e]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Top xã/phường có diện tích thu hồi lớn nhất
          </h4>
        </div>
        <div className="space-y-3.5">
          {topWards.map((ward) => {
            const ratio = (ward.recoveredArea / maxWardArea) * 100;
            return (
              <div key={ward.name} className="group">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 font-semibold group-hover:text-[#9f224e] transition-colors">
                    {ward.name}
                  </span>
                  <span className="text-gray-900 font-mono">
                    {ward.recoveredArea.toFixed(2)} ha / {ward.projectArea.toFixed(2)} ha
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  {/* Recovered portion */}
                  <div
                    className="bg-[#9f224e] h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                    title={`Thu hồi: ${ward.recoveredArea.toFixed(2)} ha`}
                  />
                  {/* Remaining portion (if recovered is less than project area) */}
                  {ward.projectArea > ward.recoveredArea && (
                    <div
                      className="bg-red-100/60 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${Math.max(0, ((ward.projectArea - ward.recoveredArea) / maxWardArea) * 100)}%` }}
                      title={`Diện tích còn lại: ${(ward.projectArea - ward.recoveredArea).toFixed(2)} ha`}
                    />
                  )}
                </div>
                <div className="flex justify-between items-center mt-0.5 text-[10px] text-gray-400 font-sans">
                  <span>{ward.count} dự án</span>
                  <span>Đã thu hồi {((ward.recoveredArea / (ward.projectArea || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Purposes Breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-red-50 rounded-lg text-[#9f224e]">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Diện tích thu hồi theo mục đích sử dụng
          </h4>
        </div>
        <div className="space-y-3.5">
          {purposeStats.map((p) => {
            const ratio = (p.recoveredArea / maxPurposeArea) * 100;
            return (
              <div key={p.name} className="group">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 font-semibold truncate max-w-[200px]" title={p.name}>
                    {p.name}
                  </span>
                  <span className="text-gray-900 font-mono">
                    {p.recoveredArea.toFixed(2)} ha
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#c2416c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-0.5 text-[10px] text-gray-400 font-sans">
                  <span>{p.count} dự án</span>
                  <span>Chiếm {((p.recoveredArea / (projects.reduce((sum, item) => sum + item.dienTichTh, 0) || 1)) * 100).toFixed(1)}% tổng số</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recovery Ratios Buckets */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-red-50 rounded-lg text-[#9f224e]">
            <PieChart className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Phân bổ mức độ đất bị thu hồi của dự án
          </h4>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* SVG Donut Chart */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {(() => {
                let cumulativePercent = 0;
                return ratioBuckets.map((bucket) => {
                  const startPercent = cumulativePercent;
                  cumulativePercent += bucket.percentage / 100;
                  const endPercent = cumulativePercent;

                  if (bucket.percentage <= 0) return null;

                  // Handle absolute 100% case
                  if (bucket.percentage >= 99.99) {
                    return (
                      <circle
                        key={bucket.name}
                        cx="50"
                        cy="50"
                        r="45"
                        fill={COLOR_MAP[bucket.color] || "#cbd5e1"}
                      />
                    );
                  }

                  const startAngle = (startPercent * 360) * (Math.PI / 180);
                  const endAngle = (endPercent * 360) * (Math.PI / 180);

                  const r = 45;
                  const cx = 50;
                  const cy = 50;

                  const x1 = cx + r * Math.cos(startAngle);
                  const y1 = cy + r * Math.sin(startAngle);
                  const x2 = cx + r * Math.cos(endAngle);
                  const y2 = cy + r * Math.sin(endAngle);

                  const largeArcFlag = bucket.percentage > 50 ? 1 : 0;
                  const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={bucket.name}
                      d={pathData}
                      fill={COLOR_MAP[bucket.color] || "#cbd5e1"}
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                      style={{ transformOrigin: "50px 50px" }}
                    />
                  );
                });
              })()}
              {/* Center Donut Hole cutout */}
              <circle cx="50" cy="50" r="26" fill="white" />
            </svg>
            
            {/* Middle Total Indicators */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-extrabold text-gray-900 font-mono leading-none">
                {projects.length.toLocaleString("en-US")}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold font-sans mt-0.5">
                Dự án
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex-1 w-full space-y-2">
            {ratioBuckets.map((bucket) => (
              <div key={bucket.name} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50 hover:bg-gray-100/50 border border-gray-100 transition-colors">
                <div 
                  className="w-3 h-3 rounded-full shrink-0 mt-0.5" 
                  style={{ backgroundColor: COLOR_MAP[bucket.color] || "#cbd5e1" }}
                />
                <div className="font-sans flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-semibold text-gray-700 truncate">{bucket.name}</p>
                    <span className="text-xs font-mono font-bold text-gray-900 shrink-0">
                      {bucket.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    <span className="font-mono font-semibold text-gray-800">{bucket.count.toLocaleString("en-US")}</span> dự án
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Funding Classification Breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-red-50 rounded-lg text-[#9f224e]">
            <Landmark className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            Phân bổ diện tích thu hồi theo nguồn vốn
          </h4>
        </div>
        <div className="space-y-4">
          {classificationStats.map((cls, idx) => {
            const colors = ["bg-[#9f224e]", "bg-[#c2416c]", "bg-[#cca150]", "bg-[#7c828c]", "bg-gray-400"];
            const bgColors = ["bg-red-50", "bg-red-50/50", "bg-amber-50", "bg-gray-100", "bg-gray-50"];
            const textColors = ["text-[#9f224e]", "text-[#c2416c]", "text-[#cca150]", "text-[#7c828c]", "text-gray-600"];
            const colorClass = colors[idx % colors.length];
            const bgColorClass = bgColors[idx % bgColors.length];
            const textColorClass = textColors[idx % textColors.length];

            return (
              <div key={cls.name} className="flex items-center justify-between gap-4 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full ${colorClass} shrink-0`} />
                  <span className="text-xs font-bold text-gray-800 truncate" title={cls.name}>
                    {cls.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-medium text-gray-500">
                    {cls.count} DA
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900 min-w-[70px] text-right">
                    {cls.recoveredArea.toFixed(1)} ha
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bgColorClass} ${textColorClass} min-w-[50px] text-center`}>
                    {cls.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
