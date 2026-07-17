/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Project } from "../types";
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Info,
  CheckSquare,
  Square
} from "lucide-react";

interface ProjectTableProps {
  projects: Project[];
  searchQuery: string;
  wardQuery: string;
  onSelectProject: (project: Project) => void;
  selectedProjectsForCompare: Project[];
  onToggleCompare: (project: Project) => void;
}

type SortField = "tenDuAn" | "xaPhuong" | "dienTichDa" | "dienTichTh" | "tyLeTh";
type SortOrder = "asc" | "desc";

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  searchQuery,
  wardQuery,
  onSelectProject,
  selectedProjectsForCompare,
  onToggleCompare,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<SortField>("dienTichTh");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Sort and Memoize projects
  const sortedProjects = useMemo(() => {
    const list = [...projects];
    return list.sort((a, b) => {
      let valA: any = a[sortField as keyof Project] || "";
      let valB: any = b[sortField as keyof Project] || "";

      if (sortField === "tyLeTh") {
        const ratioA = a.dienTichDa > 0 ? (a.dienTichTh / a.dienTichDa) : 0;
        const ratioB = b.dienTichDa > 0 ? (b.dienTichTh / b.dienTichDa) : 0;
        return sortOrder === "asc" ? ratioA - ratioB : ratioB - ratioA;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      // String sort with Vietnamese support
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB), "vi")
        : String(valB).localeCompare(String(valA), "vi");
    });
  }, [projects, sortField, sortOrder]);

  // Pagination bounds
  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, currentPage, pageSize]);

  // Highlight search terms helper
  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !text) return <span className="font-sans text-sm">{text}</span>;
    
    // Normalize to find matching indices without tone-sensitivity but display original text
    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanHighlight = highlight.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let index = cleanText.indexOf(cleanHighlight);

    if (index === -1) return <span className="font-sans text-sm text-gray-700">{text}</span>;

    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }
      // Add highlighted text
      const matchText = text.slice(index, index + highlight.length);
      parts.push(
        <mark key={index} className="bg-amber-100 text-amber-900 rounded px-0.5 font-sans font-medium">
          {matchText}
        </mark>
      );
      lastIndex = index + highlight.length;
      index = cleanText.indexOf(cleanHighlight, lastIndex);
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <span className="font-sans text-sm text-gray-700">{parts}</span>;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table controls */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50">
        <div className="font-sans text-xs font-semibold text-gray-500">
          Hiển thị <span className="text-gray-900 font-bold">{Math.min(projects.length, (currentPage - 1) * pageSize + 1)}</span> - <span className="text-gray-900 font-bold">{Math.min(projects.length, currentPage * pageSize)}</span> của <span className="text-emerald-700 font-bold">{projects.length.toLocaleString("en-US")}</span> dòng lọc được
        </div>

        <div className="flex items-center gap-2">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-sans">Hiển thị:</span>
            <select
              id="select-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-sans text-gray-700 outline-none focus:border-emerald-500"
            >
              {[10, 15, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} dòng
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table grid container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="py-2.5 px-3 w-10 text-center text-xs font-bold text-gray-500 font-sans">
                So sánh
              </th>
              
              <th 
                className="py-2.5 px-3 text-xs font-bold text-gray-500 font-sans cursor-pointer hover:bg-gray-100 transition-colors select-none w-24 whitespace-nowrap"
                onClick={() => handleSort("xaPhuong")}
              >
                <div className="flex items-center gap-1">
                  <span>Xã/phường</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>

              <th 
                className="py-2.5 px-3 text-xs font-bold text-gray-500 font-sans cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort("tenDuAn")}
              >
                <div className="flex items-center gap-1">
                  <span>Dự án</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>

              <th 
                className="py-2.5 px-3 text-xs font-bold text-gray-500 font-sans cursor-pointer hover:bg-gray-100 transition-colors select-none text-right w-24"
                onClick={() => handleSort("dienTichDa")}
              >
                <div className="flex items-center justify-end gap-1">
                  <div className="flex flex-col items-end leading-tight text-right">
                    <span>Diện tích</span>
                    <span>dự án (ha)</span>
                  </div>
                  <ArrowUpDown className="w-3 h-3 text-gray-400 shrink-0" />
                </div>
              </th>

              <th 
                className="py-2.5 px-3 text-xs font-bold text-gray-500 font-sans cursor-pointer hover:bg-gray-100 transition-colors select-none text-right w-24"
                onClick={() => handleSort("dienTichTh")}
              >
                <div className="flex items-center justify-end gap-1">
                  <div className="flex flex-col items-end leading-tight text-right">
                    <span>Diện tích</span>
                    <span>thu hồi (ha)</span>
                  </div>
                  <ArrowUpDown className="w-3 h-3 text-gray-400 shrink-0" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => {
                const ratio = project.dienTichDa > 0 
                  ? (project.dienTichTh / project.dienTichDa) * 100 
                  : 100;
                
                const isSelectedForCompare = selectedProjectsForCompare.some(
                  (p) => p.tenDuAn === project.tenDuAn && p.xaPhuong === project.xaPhuong
                );

                // Badge color based on recovery ratio
                let badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
                if (ratio >= 100) badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold";
                else if (ratio >= 50) badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                else if (ratio >= 20) badgeColor = "bg-amber-50 text-amber-700 border-amber-100";

                return (
                  <tr 
                    key={`${project.tenDuAn}-${project.xaPhuong}-${index}`}
                    className="hover:bg-gray-50/70 transition-all group"
                  >
                    {/* Checkbox Compare Column */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare(project);
                        }}
                        className="text-gray-400 hover:text-emerald-600 transition-colors inline-block"
                        title={isSelectedForCompare ? "Bỏ chọn so sánh" : "Chọn so sánh"}
                      >
                        {isSelectedForCompare ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Ward/Commune column */}
                    <td className="py-3 px-3 whitespace-nowrap text-xs font-semibold text-gray-600">
                      {highlightText(project.xaPhuong, wardQuery)}
                    </td>

                    {/* Project Name column */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => onSelectProject(project)}
                          className="text-left font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors text-xs hover:underline"
                        >
                          {highlightText(project.tenDuAn, searchQuery)}
                        </button>
                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          {project.mucDich && (
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                              {project.mucDich}
                            </span>
                          )}
                          {project.phanLoai && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>{project.phanLoai}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Project Area column */}
                    <td className="py-3 px-3 text-right text-xs font-bold text-gray-800 font-mono">
                      {project.dienTichDa > 0 
                        ? project.dienTichDa.toLocaleString("en-US", { maximumFractionDigits: 2 }) 
                        : "—"}
                    </td>

                    {/* Recovered Area & Ratio Column */}
                    <td className="py-3 px-3 text-right bg-amber-50/10 group-hover:bg-amber-50/20 transition-all">
                      <div className="text-xs font-bold text-amber-700 font-mono">
                        {project.dienTichTh.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 flex justify-end">
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] rounded border font-mono font-semibold ${badgeColor}`}>
                          {ratio.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center font-sans text-gray-400 italic">
                  Không tìm thấy dự án nào khớp với bộ lọc tìm kiếm hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination panel */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-semibold transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trang trước</span>
          </button>

          {/* Page indicator blocks */}
          <div className="hidden sm:flex items-center gap-1.5">
            {/* First Page */}
            {currentPage > 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  1
                </button>
                {currentPage > 4 && <span className="text-gray-300 text-xs">...</span>}
              </>
            )}

            {/* Generated Page buttons surrounding Current Page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(page - currentPage) <= 2)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

            {/* Last Page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-gray-300 text-xs">...</span>}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <div className="sm:hidden font-sans text-xs text-gray-500 font-medium">
            Trang <span className="text-gray-900 font-bold">{currentPage}</span> / <span className="text-gray-900 font-bold">{totalPages}</span>
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-semibold transition-all"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
