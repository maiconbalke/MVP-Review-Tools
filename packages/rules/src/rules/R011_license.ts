import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R011: Rule = {
    id: "R011",
    description: "Checks if a LICENSE file exists in the repository root",
    category: "governance",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const licensePath = join(ctx.repoPath, "LICENSE");
        if (!existsSync(licensePath)) {
            return [{
                ruleId: this.id,
                severity: "low",
                message: "Arquivo LICENSE ausente.",
                recommendation: "Adicione um arquivo LICENSE para definir a licença do projeto.",
                category: this.category
            }];
        }
        return [];
    }
};
