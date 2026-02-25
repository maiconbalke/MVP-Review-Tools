import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R012: Rule = {
    id: "R012",
    description: "Checks for the existence of CI configuration (.github/workflows)",
    category: "ci-cd",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const workflowsPath = join(ctx.repoPath, ".github", "workflows");
        if (!existsSync(workflowsPath)) {
            return [{
                ruleId: this.id,
                severity: "medium",
                message: "Configuração de CI não encontrada.",
                recommendation: "Configure integração contínua usando GitHub Actions ou outra ferramenta de CI.",
                category: this.category
            }];
        }
        return [];
    }
};
