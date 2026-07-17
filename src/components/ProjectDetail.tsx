/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Project } from "../types";
import { 
  X, 
  MapPin, 
  Landmark, 
  FileSpreadsheet, 
  Tag, 
  Compass, 
  HelpCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  if (!project) return null;

  const ratio = project.dienTichDa > 0 
    ? (project.dienTichTh / project.dienTichDa) * 100 
    : 100;

  // Render textual analysis
  const getImpactSummary = () => {
    const pName = project.tenDuAn;
    const ward = project.xaPhuong;
    const pArea = project.dienTichDa;
    const rArea = project.dienTichTh;

    if (pArea <= 0) {
      return `Dự án "${pName}" tại địa bàn xã/phường ${ward} ghi nhận diện tích bị thu hồi là ${rArea.toLocaleString("en-US")} ha để phục vụ mục đích ${project.mucDich.toLowerCase()}. Dự án này chưa công bố thông tin tổng diện tích quy hoạch gốc.`;
    }

    if (ratio >= 99.9) {
      return `Dự án "${pName}" tại xã/phường ${ward} bị THU HỒI TOÀN BỘ (100% diện tích) với quy mô ${rArea.toLocaleString("en-US")} ha. Việc thu hồi toàn phần này chủ yếu phục vụ các công trình thuộc mục đích ${project.mucDich.toLowerCase()}, đòi hỏi công tác đền bù và giải phóng mặt bằng 100%.`;
    }

    const remaining = pArea - rArea;
    return `Dự án "${pName}" tại xã/phường ${ward} bị THU HỒI MỘT PHẦN diện tích. Cụ thể, cơ quan chức năng tiến hành thu hồi ${rArea.toLocaleString("en-US")} ha trong tổng số ${pArea.toLocaleString("en-US")} ha đất quy hoạch (chiếm tỉ lệ ${ratio.toFixed(1)}%). Phần diện tích còn lại ngoài phạm vi thu hồi là ${remaining.toLocaleString("en-US")} ha (${(100 - ratio).toFixed(1)}%).`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/45 backdrop-blur-xs animate-fade-in">
      {/* Modal Card */}
      <div 
        id="project-detail-modal"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-fade-in"
      >
        {/* Header */}
        <div className="bg-[#9f224e] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all outline-none"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 text-red-100 text-xs font-semibold tracking-widest mb-2 font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Thông tin chi tiết dự án</span>
          </div>
          
          <h3 className="text-xl font-bold pr-8 leading-snug">
            {project.tenDuAn}
          </h3>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics (Visual Progress) */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-3">
              Quy mô thu hồi đất
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="font-sans">
                <span className="text-[10px] text-gray-500 font-semibold block">Diện tích quy hoạch</span>
                <span className="text-xl font-bold text-gray-800 font-mono">
                  {project.dienTichDa > 0 
                    ? `${project.dienTichDa.toLocaleString("en-US")} ha` 
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div className="font-sans border-l border-gray-200 pl-4">
                <span className="text-[10px] text-[#9f224e] font-semibold block">Diện tích bị thu hồi</span>
                <span className="text-xl font-bold text-[#9f224e] font-mono">
                  {project.dienTichTh.toLocaleString("en-US")} ha
                </span>
              </div>
            </div>

            {/* Visual Bar gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Tỉ lệ đất bị thu hồi</span>
                <span className="font-mono text-[#9f224e] font-bold">{ratio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-[#9f224e] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ratio)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-sans">
                <span>Đã thu hồi: {project.dienTichTh.toFixed(2)} ha</span>
                {project.dienTichDa > 0 && (
                  <span>Còn lại: {Math.max(0, project.dienTichDa - project.dienTichTh).toFixed(2)} ha</span>
                )}
              </div>
            </div>
          </div>

          {/* Full Registry Details list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Col */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-red-50 text-[#9f224e] rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="font-sans">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Xã / Phường</span>
                  <span className="text-sm font-semibold text-gray-800">{project.xaPhuong}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="font-sans">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Mục đích sử dụng</span>
                  <span className="text-sm font-semibold text-gray-800 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {project.mucDich || "Chưa xác định"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="font-sans">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Đơn vị đăng ký</span>
                  <span className="text-sm font-semibold text-gray-800">{project.donVi || "Ủy ban nhân dân"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="font-sans">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Phân loại nguồn vốn</span>
                  <span className="text-sm font-semibold text-gray-800 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {project.phanLoai || "Vốn ngân sách"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytical summary card */}
          <div className="bg-red-50/40 border border-[#9f224e]/10 rounded-2xl p-4 flex gap-3">
            {ratio >= 99.9 ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#9f224e] shrink-0 mt-0.5" />
            )}
            <div className="font-sans text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900 font-bold block mb-1">Đánh giá tác động thu hồi:</strong>
              {getImpactSummary()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-150 p-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-all outline-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
