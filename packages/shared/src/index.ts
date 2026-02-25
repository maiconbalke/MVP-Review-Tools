export type Severity = "info" | "low" | "medium" | "high";

export interface Job {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
}

export interface Finding {
    ruleId: string;
    severity: Severity;
    message: string;
    recommendation?: string;
    category?: string;
}

export interface AnalysisResult {
    jobId: string;
    processedAt: string;
    input: any;
    repoPath?: string;
    findings: Finding[];
    score: number;
    grade: "A" | "B" | "C" | "D" | "E" | "F";
    summary: {
        info: number;
        low: number;
        medium: number;
        high: number;
        total: number;
    };
}
export * from "./policy.js";
