import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check, Info, RotateCcw, GraduationCap } from 'lucide-react';
import { SemesterData, SubjectGrade, calculateCgpa, calculateSgpa } from '../../../utils/cgpa';
import { useApp } from '../../../context/AppContext';

export const CgpaCalculatorTool: React.FC = () => {
  const { addToast } = useApp();
  const [copied, setCopied] = useState(false);

  const [semesters, setSemesters] = useState<SemesterData[]>([
    {
      id: 'sem-1',
      name: 'Semester 1',
      subjects: [
        { id: 'sub-1', name: 'Data Structures', credits: 4, gradePoint: 9 },
        { id: 'sub-2', name: 'Mathematics II', credits: 4, gradePoint: 8 },
        { id: 'sub-3', name: 'Operating Systems', credits: 3, gradePoint: 10 },
        { id: 'sub-4', name: 'Physics Lab', credits: 2, gradePoint: 9 },
      ],
    },
  ]);

  const addSemester = () => {
    const newSem: SemesterData = {
      id: `sem-${Date.now()}`,
      name: `Semester ${semesters.length + 1}`,
      subjects: [
        { id: `sub-${Date.now()}-1`, name: 'Course 1', credits: 3, gradePoint: 8 },
        { id: `sub-${Date.now()}-2`, name: 'Course 2', credits: 3, gradePoint: 8 },
      ],
    };
    setSemesters([...semesters, newSem]);
  };

  const removeSemester = (semId: string) => {
    if (semesters.length <= 1) return;
    setSemesters(semesters.filter((s) => s.id !== semId));
  };

  const addSubject = (semId: string) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const newSub: SubjectGrade = {
            id: `sub-${Date.now()}`,
            name: `Subject ${sem.subjects.length + 1}`,
            credits: 3,
            gradePoint: 8,
          };
          return { ...sem, subjects: [...sem.subjects, newSub] };
        }
        return sem;
      })
    );
  };

  const removeSubject = (semId: string, subId: string) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          if (sem.subjects.length <= 1) return sem;
          return { ...sem, subjects: sem.subjects.filter((s) => s.id !== subId) };
        }
        return sem;
      })
    );
  };

  const updateSubject = (semId: string, subId: string, field: keyof SubjectGrade, value: string | number) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => {
              if (sub.id === subId) {
                return { ...sub, [field]: value };
              }
              return sub;
            }),
          };
        }
        return sem;
      })
    );
  };

  const resetAll = () => {
    setSemesters([
      {
        id: 'sem-1',
        name: 'Semester 1',
        subjects: [
          { id: 'sub-1', name: 'Subject 1', credits: 3, gradePoint: 8 },
          { id: 'sub-2', name: 'Subject 2', credits: 4, gradePoint: 9 },
        ],
      },
    ]);
  };

  const { cgpa, totalCredits } = calculateCgpa(semesters);

  const copyResult = () => {
    const summary = `ToolNest CGPA Report\nOverall CGPA: ${cgpa.toFixed(2)}\nTotal Credits: ${totalCredits}\nSemesters: ${semesters.length}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'CGPA Summary copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Educational notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Grading Scale & Formula</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            SGPA = Σ (Course Credits × Grade Points) / Σ (Course Credits). Rules and 10-point vs 4-point scales are institution-specific; enter the exact credit weights and grade points prescribed by your university.
          </p>
        </div>
      </div>

      {/* Cumulative Summary Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
            Cumulative Grade Point Average
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl sm:text-5xl font-black text-light-text dark:text-dark-text tracking-tight">
              {cgpa.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-light-muted dark:text-dark-muted">
              across {totalCredits} Total Credits
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyResult}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-accent text-white font-semibold text-xs transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
          <button
            onClick={resetAll}
            className="p-2 rounded-xl border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-light-muted"
            title="Reset calculator"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Semesters list */}
      <div className="space-y-6">
        {semesters.map((sem, sIdx) => {
          const semStats = calculateSgpa(sem.subjects);

          return (
            <div
              key={sem.id}
              className="p-5 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4"
            >
              {/* Semester Header */}
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base text-light-text dark:text-dark-text">{sem.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple">
                    SGPA: {semStats.sgpa.toFixed(2)} ({semStats.totalCredits} credits)
                  </span>
                </div>

                {semesters.length > 1 && (
                  <button
                    onClick={() => removeSemester(sem.id)}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Semester</span>
                  </button>
                )}
              </div>

              {/* Subject Rows */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted px-1">
                  <span className="col-span-6 sm:col-span-6">Subject / Course</span>
                  <span className="col-span-3 sm:col-span-2 text-center">Credits</span>
                  <span className="col-span-3 sm:col-span-3 text-center">Grade Point</span>
                  <span className="hidden sm:block sm:col-span-1 text-center">Action</span>
                </div>

                {sem.subjects.map((sub) => (
                  <div key={sub.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => updateSubject(sem.id, sub.id, 'name', e.target.value)}
                      placeholder="Course name"
                      className="col-span-6 sm:col-span-6 px-3 py-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-light-text dark:text-dark-text focus:outline-none"
                    />

                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      max="30"
                      value={sub.credits || ''}
                      onChange={(e) =>
                        updateSubject(sem.id, sub.id, 'credits', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Credits"
                      className="col-span-3 sm:col-span-2 px-2 py-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-center text-light-text dark:text-dark-text focus:outline-none"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      max="10"
                      value={sub.gradePoint || ''}
                      onChange={(e) =>
                        updateSubject(sem.id, sub.id, 'gradePoint', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Grade Point"
                      className="col-span-3 sm:col-span-3 px-2 py-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-center text-light-text dark:text-dark-text focus:outline-none"
                    />

                    <div className="col-span-12 sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeSubject(sem.id, sub.id)}
                        disabled={sem.subjects.length <= 1}
                        className="p-1 rounded text-light-muted hover:text-rose-500 disabled:opacity-20"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Subject button */}
              <button
                onClick={() => addSubject(sem.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course to {sem.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Semester button */}
      <button
        onClick={addSemester}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border hover:border-brand-purple/50 text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-brand-purple flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Another Semester</span>
      </button>
    </div>
  );
};
