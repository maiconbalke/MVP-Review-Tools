import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PolicyConfig, validatePolicy, defaultPolicy } from "@review-tools/shared";

export function loadPolicy(rootDir: string, profile?: string): PolicyConfig {
    const candidates: string[] = [];

    if (profile) {
        candidates.push(join(rootDir, "policies", `${profile}.json`));
    }
    candidates.push(join(rootDir, "policies", "standard.json"));
    candidates.push(join(rootDir, "policies", "default.json"));

    for (const policyPath of candidates) {
        if (existsSync(policyPath)) {
            console.log(`[worker] Using policy file: ${policyPath}`);
            if (profile && !policyPath.includes(`${profile}.json`)) {
                console.log(`[worker] Fallback was used (requested: ${profile})`);
            }
            try {
                const raw = readFileSync(policyPath, "utf-8");
                const parsed = JSON.parse(raw);
                return validatePolicy(parsed);
            } catch (error) {
                console.warn(`[worker] Warning: Invalid policy file at ${policyPath}. Error: ${error}`);
            }
        }
    }

    console.warn(`[worker] Warning: No policy file found. Using default built-in policy.`);
    return defaultPolicy;
}
