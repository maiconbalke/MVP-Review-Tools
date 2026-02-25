export type SeverityPenalties = {
    info: number;
    low: number;
    medium: number;
    high: number;
};

export type GradeThresholds = {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
};

export interface PolicyConfig {
    severityPenalties: SeverityPenalties;
    categoryMultipliers: Record<string, number>;
    ruleOverrides: {
        disabledRules: string[];
        severityByRuleId: Record<string, keyof SeverityPenalties>;
    };
    gradeThresholds: GradeThresholds;
}

export const defaultPolicy: PolicyConfig = {
    severityPenalties: { info: 0, low: 5, medium: 15, high: 30 },
    categoryMultipliers: {
        "security": 1.5,
        "ci-cd": 1.2,
        "repository-hygiene": 1.2,
        "governance": 1.0,
        "documentation": 0.8,
        "dependencies": 1.0,
        "nodejs": 1.0,
        "typescript": 1.0,
        "docker": 1.0,
        "engine": 1.0,
        "nodejs/typescript/docker": 1.0
    },
    ruleOverrides: {
        disabledRules: [],
        severityByRuleId: {}
    },
    gradeThresholds: { A: 90, B: 80, C: 70, D: 60, E: 50, F: 0 }
};

export function validatePolicy(policy: any | null): PolicyConfig {
    if (!policy) {
        return defaultPolicy;
    }

    return {
        severityPenalties: {
            ...defaultPolicy.severityPenalties,
            ...(policy.severityPenalties || {})
        },
        categoryMultipliers: {
            ...defaultPolicy.categoryMultipliers,
            ...(policy.categoryMultipliers || {})
        },
        ruleOverrides: {
            disabledRules: policy.ruleOverrides?.disabledRules || [],
            severityByRuleId: policy.ruleOverrides?.severityByRuleId || {}
        },
        gradeThresholds: {
            ...defaultPolicy.gradeThresholds,
            ...(policy.gradeThresholds || {})
        }
    };
}
