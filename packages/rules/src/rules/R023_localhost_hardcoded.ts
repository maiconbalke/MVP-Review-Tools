import { Rule, RuleContext } from "../types";
import { Finding } from "@review-tools/shared";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

export const R023: Rule = {
    id: "R023",
    description: "Verifica referências a localhost no código fonte",
    category: "security",
    async evaluate(ctx: RuleContext): Promise<Finding[]> {
        try {
            if (!existsSync(ctx.repoPath)) return [];

            const files = readdirSync(ctx.repoPath);
            for (const file of files) {
                const fullPath = join(ctx.repoPath, file);
                const stat = statSync(fullPath);

                if (stat.isFile()) {
                    const ext = extname(file);
                    if (ext === ".ts" || ext === ".js") {
                        const content = readFileSync(fullPath, "utf-8");
                        if (content.includes("localhost")) {
                            return [{
                                ruleId: this.id,
                                severity: "medium",
                                category: "security",
                                message: "Referência a localhost encontrada no código.",
                                recommendation: "Evite hardcode de endpoints locais; utilize variáveis de ambiente."
                            }];
                        }
                    }
                }
            }
        } catch { }
        return [];
    }
};
