import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R013: Rule = {
    id: "R013",
    description: "Checks if a .env file was accidentally committed to the repository",
    category: "security",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const envPath = join(ctx.repoPath, ".env");
        if (existsSync(envPath)) {
            return [{
                ruleId: this.id,
                severity: "high",
                message: "Arquivo .env versionado no repositório.",
                recommendation: "Remova o arquivo .env do versionamento e utilize variáveis de ambiente seguras.",
                category: this.category
            }];
        }
        return [];
    }
};
