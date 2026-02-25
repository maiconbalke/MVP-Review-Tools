import { Finding } from "@review-tools/shared";

export interface RuleContext {
    repoPath: string;
    jobId: string;
    input: any;
}

export interface Rule {
    id: string;
    description: string;
    category: string;
    evaluate(ctx: RuleContext): Promise<Finding[]>;
}
