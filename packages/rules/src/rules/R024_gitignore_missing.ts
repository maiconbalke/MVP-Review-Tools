import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R024: Rule = {
    id: "R024",
    description: "Verifica se há arquivo .gitignore",
    category: "repository-hygiene",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const gitignorePath = join(ctx.repoPath, ".gitignore");
        if (!existsSync(gitignorePath)) {
            return [{
                ruleId: this.id,
                severity: "medium",
                category: "repository-hygiene",
                message: "Arquivo .gitignore ausente.",
                recommendation: "Adicione um .gitignore apropriado para evitar versionamento de arquivos sensíveis."
            }];
        }
        return [];
    }
};
