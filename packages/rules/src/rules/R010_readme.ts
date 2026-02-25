import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R010: Rule = {
    id: "R010",
    description: "Checks if a README.md file exists in the repository root",
    category: "documentation",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const readmePath = join(ctx.repoPath, "README.md");
        if (!existsSync(readmePath)) {
            return [{
                ruleId: this.id,
                severity: "medium",
                message: "Arquivo README.md ausente.",
                recommendation: "Adicione um README.md explicando propósito, instalação e uso do projeto.",
                category: this.category
            }];
        }
        return [];
    }
};
