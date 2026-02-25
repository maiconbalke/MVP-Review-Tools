import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync } from "fs";
import { join } from "path";

export const R003: Rule = {
    id: "R003",
    description: "Checks for Dockerfile in the repository pattern",
    category: "docker",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const dockerfilePath = join(ctx.repoPath, "Dockerfile");
        if (!existsSync(dockerfilePath)) {
            return [{
                ruleId: this.id,
                severity: "info",
                message: "Missing Dockerfile",
                recommendation: "Adicione um Dockerfile para containerizar a aplicação.",
                category: this.category
            }];
        }
        return [];
    }
};
