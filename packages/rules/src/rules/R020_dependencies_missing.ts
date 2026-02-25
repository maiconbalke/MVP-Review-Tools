import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const R020: Rule = {
    id: "R020",
    description: "Verifica se o package.json declara dependencies",
    category: "dependencies",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const pkgPath = join(ctx.repoPath, "package.json");
        if (!existsSync(pkgPath)) return [];

        try {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
            if (!pkg.dependencies) {
                return [{
                    ruleId: this.id,
                    severity: "low",
                    category: "dependencies",
                    message: "Projeto não declara dependências em package.json.",
                    recommendation: "Garanta que as dependências estejam corretamente declaradas."
                }];
            }
        } catch { }
        return [];
    }
};
