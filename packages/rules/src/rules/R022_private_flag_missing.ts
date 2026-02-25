import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const R022: Rule = {
    id: "R022",
    description: "Verifica se a flag private está definida",
    category: "governance",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const pkgPath = join(ctx.repoPath, "package.json");
        if (!existsSync(pkgPath)) return [];

        try {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
            if (pkg.private !== true) {
                return [{
                    ruleId: this.id,
                    severity: "low",
                    category: "governance",
                    message: "Campo 'private' não definido no package.json.",
                    recommendation: "Considere adicionar \"private\": true para evitar publicação acidental no npm."
                }];
            }
        } catch { }
        return [];
    }
};
