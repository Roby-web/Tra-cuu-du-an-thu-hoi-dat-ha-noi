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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top Wards Column */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Top xã/phường có diện tích thu hồi lớn nhất
          </h4>
        </div>
        <div className="space-y-3.5">
          {topWards.map((ward) => {
            const ratio = (ward.recoveredArea / maxWardArea) * 100;
            return (
              <div key={ward.name} className="group">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-gray-700 font-semibold group-hover:text-emerald-700 transition-colors">
                    {ward.name}
                  </span>
                  <span className="text-gray-900 font-mono">
                    {ward.recoveredArea.toFixed(2)} ha / {ward.projectArea.toFixed(2)} ha
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                  {/* Recovered portion */}
                  <div
                    className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                    title={`Thu hồi: ${ward.recoveredArea.toFixed(2)} ha`}
                  />
                  {/* Remaining portion (if recovered is less than project area) */}
                  {ward.projectArea > ward.recoveredArea && (
                    <div
                      className="bg-emerald-100 h-full rounded-r-full transition-all duration-500"
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
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
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
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
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
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
            <PieChart className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Phân bổ mức độ đất bị thu hồi của dự án
          </h4>
        </div>
        <div className="space-y-4">
          <div className="flex h-5 w-full rounded-lg overflow-hidden bg-gray-150">
            {ratioBuckets.map((bucket) => (
              <div
                key={bucket.name}
                className={`${bucket.color} h-full transition-all duration-500`}
                style={{ width: `${bucket.percentage}%` }}
                title={`${bucket.name}: ${bucket.count} dự án (${bucket.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {ratioBuckets.map((bucket) => (
              <div key={bucket.name} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-3.5 h-3.5 rounded-md ${bucket.color} shrink-0 mt-0.5`} />
                <div className="font-sans">
                  <p className="text-xs font-semibold text-gray-700">{bucket.name}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    <span className="font-mono font-bold text-gray-900">{bucket.count}</span> dự án ({bucket.percentage.toFixed(1)}%)
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
          <div className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
            <Landmark className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Phân bổ diện tích thu hồi theo nguồn vốn
          </h4>
        </div>
        <div className="space-y-4">
          {classificationStats.map((cls, idx) => {
            const colors = ["bg-sky-600", "bg-purple-600", "bg-teal-600", "bg-amber-600", "bg-gray-600"];
            const bgColors = ["bg-sky-50", "bg-purple-50", "bg-teal-50", "bg-amber-50", "bg-gray-50"];
            const textColors = ["text-sky-700", "text-purple-700", "text-teal-700", "text-amber-700", "text-gray-700"];
            const colorClass = colors[idx % colors.length];
            const bgColorClass = bgColors[idx % bgColors.length];
            const textColorClass = textColors[idx % textColors.length];

            return (
              <div key={cls.name} className="flex items-center justify-between gap-4 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
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
