import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const R021: Rule = {
    id: "R021",
    description: "Verifica se o projeto possui apenas devDependencies",
    category: "dependencies",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        const pkgPath = join(ctx.repoPath, "package.json");
        if (!existsSync(pkgPath)) return [];

        try {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
            const hasDev = pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0;
            const hasDep = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;

            if (hasDev && !hasDep) {
                return [{
                    ruleId: this.id,
                    severity: "info",
                    category: "dependencies",
                    message: "Projeto possui apenas devDependencies.",
                    recommendation: "Verifique se dependências de produção estão corretamente declaradas."
                }];
            }
        } catch { }
        return [];
    }
};
