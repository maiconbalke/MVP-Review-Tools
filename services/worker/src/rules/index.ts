import { existsSync, readdirSync } from "fs";
import { join } from "path";

export type Finding = {
    ruleId: string;
    severity: "info" | "low" | "medium" | "high";
    message: string;
};

function fileExists(root: string, fileName: string): boolean {
    return existsSync(join(root, fileName));
}

export function runRules(repoPath: string): Finding[] {
    const findings: Finding[] = [];

    // R001 - package.json
    if (fileExists(repoPath, "package.json")) {
        findings.push({
            ruleId: "R001",
            severity: "info",
            message: "package.json detected."
        });
    } else {
        findings.push({
            ruleId: "R001",
            severity: "low",
            message: "No package.json found."
        });
    }

    // R002 - tsconfig.json
    if (fileExists(repoPath, "tsconfig.json")) {
        findings.push({
            ruleId: "R002",
            severity: "info",
            message: "TypeScript configuration detected."
        });
    } else {
        findings.push({
            ruleId: "R002",
            severity: "info",
            message: "No TypeScript configuration detected."
        });
    }

    // R003 - Dockerfile
    if (fileExists(repoPath, "Dockerfile")) {
        findings.push({
            ruleId: "R003",
            severity: "info",
            message: "Dockerfile detected."
        });
    } else {
        findings.push({
            ruleId: "R003",
            severity: "info",
            message: "No Dockerfile detected."
        });
    }

    return findings;
}