import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R001: Rule = {
    id: "R001",
    description: "Checks for package.json in the repository pattern",
    category: "nodejs",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const packageJsonPath = join(ctx.repoPath, "package.json");
        if (!existsSync(packageJsonPath)) {
            return [{
                ruleId: this.id,
                severity: "low",
                message: "Missing package.json file",
                recommendation: "Garanta que o arquivo package.json esteja versionado/commitado se este for um projeto Node.js.",
                category: this.category
            }];
        }
        return [];
    }
};
