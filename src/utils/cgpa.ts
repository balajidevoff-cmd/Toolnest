export interface SubjectGrade {
  id: string;
  name: string;
  credits: number;
  gradePoint: number;
}

export interface SemesterData {
  id: string;
  name: string;
  subjects: SubjectGrade[];
}

/**
 * Calculates weighted SGPA for a semester.
 * SGPA = sum(credits * gradePoint) / sum(credits)
 */
export function calculateSgpa(subjects: SubjectGrade[]): { sgpa: number; totalCredits: number } {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const s of subjects) {
    if (s.credits > 0 && s.gradePoint >= 0) {
      totalCredits += s.credits;
      totalWeightedPoints += s.credits * s.gradePoint;
    }
  }

  const sgpa = totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  return { sgpa, totalCredits };
}

/**
 * Calculates cumulative CGPA across multiple semesters.
 * CGPA = sum(semester total weighted points) / sum(all semester credits)
 */
export function calculateCgpa(semesters: SemesterData[]): { cgpa: number; totalCredits: number } {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const sem of semesters) {
    for (const s of sem.subjects) {
      if (s.credits > 0 && s.gradePoint >= 0) {
        totalCredits += s.credits;
        totalWeightedPoints += s.credits * s.gradePoint;
      }
    }
  }

  const cgpa = totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  return { cgpa, totalCredits };
}
