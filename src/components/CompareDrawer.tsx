/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Project } from "../types";
import { X, ArrowRight, BarChart2, Check, Scale } from "lucide-react";

interface CompareDrawerProps {
  selectedProjects: Project[];
  onRemoveProject: (project: Project) => void;
  onClearAll: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  selectedProjects,
  onRemoveProject,
  onClearAll,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  if (selectedProjects.length === 0) return null;

  return (
    <>
      {/* Floating comparison bar at the bottom */}
      <div 
        id="compare-floating-bar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 border border-gray-800 text-white rounded-2xl shadow-2xl px-5 py-4 flex flex-col md:flex-row items-center gap-4 max-w-[95vw] md:max-w-4xl animate-fade-in"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#9f224e] rounded-xl">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="font-sans text-center md:text-left">
            <p className="text-sm font-bold">So sánh quy mô thu hồi đất</p>
            <p className="text-xs text-gray-400">
              Đã chọn <span className="text-red-400 font-bold">{selectedProjects.length}/3</span> dự án để đối chiếu
            </p>
          </div>
        </div>

        {/* Selected project mini tags */}
        <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto">
          {selectedProjects.map((p, idx) => (
            <div 
              key={`${p.tenDuAn}-${idx}`}
              className="bg-gray-800 border border-gray-750 rounded-xl pl-3 pr-2 py-1.5 flex items-center gap-2 text-xs text-gray-200"
            >
              <span className="truncate max-w-[120px] font-medium" title={p.tenDuAn}>
                {p.tenDuAn}
              </span>
              <button 
                type="button"
                onClick={() => onRemoveProject(p)}
                className="text-gray-400 hover:text-red-400 p-0.5 rounded-full hover:bg-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 transition-colors"
          >
            Xóa hết
          </button>
          
          <button
            type="button"
            id="btn-trigger-compare"
            onClick={() => setIsOpenModal(true)}
            className="bg-[#9f224e] hover:bg-[#831b3f] text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1 transition-all"
          >
            <span>So sánh ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side-by-side comparison modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-xs animate-fade-in">
          <div 
            id="compare-modal-box"
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-150 flex flex-col max-h-[85vh] animate-fade-in"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#9f224e]" />
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                  Bảng so sánh chi tiết dự án thu hồi đất
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid Table */}
            <div className="overflow-x-auto p-6 flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">
                      Thuộc tính / Tiêu chí
                    </th>
                    {selectedProjects.map((p, idx) => (
                      <th 
                        key={idx}
                        className="py-3 px-4 text-xs font-bold text-gray-800 uppercase tracking-wider w-1/4 bg-gray-50/50 rounded-t-xl"
                      >
                        Dự án #{idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-sm">
                  {/* Name Row */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-gray-500 text-xs">
                      TÊN DỰ ÁN
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-4 px-4 font-bold text-gray-900 bg-gray-50/30">
                        {p.tenDuAn}
                      </td>
                    ))}
                  </tr>

                  {/* Ward Row */}
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-gray-500 text-xs">
                      XÃ / PHƯỜNG
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-3.5 px-4 font-semibold text-gray-600 bg-gray-50/30">
                        {p.xaPhuong}
                      </td>
                    ))}
                  </tr>

                  {/* Purpose Row */}
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-gray-500 text-xs">
                      MỤC ĐÍCH SỬ DỤNG
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-3.5 px-4 bg-gray-50/30">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium text-xs">
                          {p.mucDich || "Chưa xác định"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Registered Unit Row */}
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-gray-500 text-xs">
                      ĐƠN VỊ ĐĂNG KÝ
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-xs font-medium text-gray-600 bg-gray-50/30">
                        {p.donVi || "Chưa cập nhật"}
                      </td>
                    ))}
                  </tr>

                  {/* Funding Source Row */}
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-gray-500 text-xs">
                      PHÂN LOẠI NGUỒN VỐN
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-3.5 px-4 bg-gray-50/30">
                        <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {p.phanLoai || "Vốn ngân sách"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Total Project Area Row */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-gray-500 text-xs">
                      DIỆN TÍCH QUY HOẠCH
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-4 px-4 font-mono font-bold text-gray-800 bg-gray-50/30 text-base">
                        {p.dienTichDa > 0 ? `${p.dienTichDa.toLocaleString("en-US")} ha` : "Chưa xác định"}
                      </td>
                    ))}
                  </tr>

                  {/* Recovered Area Row */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-gray-500 text-xs text-amber-700">
                      DIỆN TÍCH BỊ THU HỒI
                    </td>
                    {selectedProjects.map((p, idx) => (
                      <td key={idx} className="py-4 px-4 font-mono font-extrabold text-amber-700 bg-amber-50/15 text-base">
                        {p.dienTichTh.toLocaleString("en-US")} ha
                      </td>
                    ))}
                  </tr>

                  {/* Ratio Row */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-gray-500 text-xs text-[#9f224e]">
                      TỈ LỆ THU HỒI ĐẤT
                    </td>
                    {selectedProjects.map((p, idx) => {
                      const ratio = p.dienTichDa > 0 ? (p.dienTichTh / p.dienTichDa) * 100 : 100;
                      return (
                        <td key={idx} className="py-4 px-4 bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#9f224e] text-base">
                              {ratio.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-400">
                              {ratio >= 99.9 ? "(Thu hồi 100%)" : "(Thu hồi 1 phần)"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1.5 max-w-[150px]">
                            <div 
                              className="bg-[#9f224e] h-full rounded-full"
                              style={{ width: `${Math.min(100, ratio)}%` }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-150 p-4 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs outline-none"
              >
                Đóng so sánh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
