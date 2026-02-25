import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R002: Rule = {
    id: "R002",
    description: "Checks for tsconfig.json in the repository",
    category: "typescript",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const tsconfigPath = join(ctx.repoPath, "tsconfig.json");
        if (!existsSync(tsconfigPath)) {
            return [{
                ruleId: this.id,
                severity: "info",
                message: "Missing tsconfig.json file",
                recommendation: "Garanta que o arquivo tsconfig.json esteja versionado/commitado se este for um projeto TypeScript.",
                category: this.category
            }];
        }
        return [];
    }
};
