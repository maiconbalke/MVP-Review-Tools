import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    writeFileSync,
    createReadStream
} from "fs";
import { join } from "path";
import * as unzipper from "unzipper";
import { rules } from "@review-tools/rules";
import { Finding } from "@review-tools/shared";
import { loadPolicy } from "./policy.js";

const ROOT_DIR = process.env.INIT_CWD ?? process.cwd();

const QUEUE_DIR = join(ROOT_DIR, "data", "queue");
const PROCESSING_DIR = join(ROOT_DIR, "data", "processing");
const RESULTS_DIR = join(ROOT_DIR, "data", "results");
const DONE_DIR = join(ROOT_DIR, "data", "done");
const WORK_DIR = join(ROOT_DIR, "data", "work");

function ensureDirs() {
    for (const dir of [QUEUE_DIR, PROCESSING_DIR, RESULTS_DIR, DONE_DIR, WORK_DIR]) {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

type Job = {
    jobId: string;
    createdAt: string;
    body: {
        uploadPath?: string;
        repoUrl?: string;
    };
    status: string;
    policyProfile?: string;
};

async function extractZip(zipPath: string, destDir: string) {
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    await new Promise<void>((resolve, reject) => {
        createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: destDir }))
            .on("close", () => resolve())
            .on("error", reject);
    });
}

async function processJob(jobPath: string, file: string) {
    const raw = readFileSync(jobPath, "utf-8");
    const job = JSON.parse(raw) as Job;
    const jobId = job.jobId || file.replace(/\.json$/, "");

    const policyProfile = job.policyProfile || "standard";
    const policy = loadPolicy(ROOT_DIR, policyProfile);

    const policyMaps: Record<string, Record<string, number>> = {
        standard: { high: 30, medium: 15, low: 5, info: 0 },
        strict: { high: 60, medium: 30, low: 10, info: 0 },
        security: { high: 50, medium: 25, low: 8, info: 0 }
    };
    const penalties = policyMaps[policyProfile] || policyMaps["standard"];

    console.log(`[worker] start policyProfile=${policyProfile} jobId=${jobId}`);

    const body = job.body ?? {};
    const repoDir = join(WORK_DIR, jobId, "repo");

    if (body.uploadPath) {
        // console.log(`[worker] extracting zip ${body.uploadPath}`);
        await extractZip(body.uploadPath, repoDir);
    }

    const ctx = {
        repoPath: repoDir,
        jobId,
        input: body
    };

    const summary = {
        info: 0,
        low: 0,
        medium: 0,
        high: 0,
        total: 0
    };

    const findings: Finding[] = [];

    for (const rule of rules) {
        if (policy.ruleOverrides.disabledRules.includes(rule.id)) {
            // console.log(`[worker] Skipping disabled rule: ${rule.id}`);
            continue;
        }
        try {
            const result = await rule.evaluate(ctx);
            const modifiedResult = result.map(f => {
                if (policy.ruleOverrides.severityByRuleId[f.ruleId]) {
                    f.severity = policy.ruleOverrides.severityByRuleId[f.ruleId] as Finding["severity"];
                }
                return f;
            });
            findings.push(...modifiedResult);
        } catch (err: any) {
            findings.push({
                ruleId: "R000",
                severity: "medium",
                message: `Rule execution failed: ${rule.id}`,
                recommendation: "Check worker logs / fix rule",
                category: "engine"
            });
            console.error(`[worker] Rule ${rule.id} failed:`, err);
        }
    }

    let penaltySum = 0;

    for (const f of findings) {
        summary[f.severity]++;
        summary.total++;

        penaltySum += penalties[f.severity] || 0;
    }

    const score = Math.max(0, 100 - penaltySum);

    let grade: "A" | "B" | "C" | "D" | "E" | "F" = "F";
    const t = policy.gradeThresholds;
    if (score >= t.A) grade = "A";
    else if (score >= t.B) grade = "B";
    else if (score >= t.C) grade = "C";
    else if (score >= t.D) grade = "D";
    else if (score >= t.E) grade = "E";

    const result = {
        jobId,
        processedAt: new Date().toISOString(),
        policyProfile,
        input: job.body,
        repoPath: repoDir,
        score,
        grade,
        summary,
        findings
    };

    const outPath = join(RESULTS_DIR, `${jobId}.json`);
    writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

    job.status = "done";
    writeFileSync(jobPath, JSON.stringify(job, null, 2), "utf-8");
    const donePath = join(DONE_DIR, `${jobId}.json`);
    renameSync(jobPath, donePath);

    console.log(`[worker] done policyProfile=${policyProfile} jobId=${jobId} score=${score} grade=${grade}`);
}

async function main() {
    ensureDirs();
    console.log("[worker] started");

    while (true) {
        const files = readdirSync(QUEUE_DIR).filter((f) => f.endsWith(".json"));

        if (files.length === 0) {
            await sleep(1000);
            continue;
        }

        const file = files[0];
        const src = join(QUEUE_DIR, file);
        const processing = join(PROCESSING_DIR, file);

        renameSync(src, processing);

        try {
            const raw = readFileSync(processing, "utf-8");
            const job = JSON.parse(raw);
            job.status = "processing";
            writeFileSync(processing, JSON.stringify(job, null, 2), "utf-8");
        } catch (e) { }

        try {
            await processJob(processing, file);
        } catch (err) {
            console.error("[worker] error", err);
            // Move back to queue or error...
            try {
                const r = readFileSync(processing, "utf-8");
                const j = JSON.parse(r);
                j.status = "queued";
                writeFileSync(processing, JSON.stringify(j, null, 2), "utf-8");
            } catch (e) { }
            renameSync(processing, src);
        }

        await sleep(1000);
    }
}

main().catch((e) => {
    console.error("[worker] fatal", e);
    process.exit(1);
});