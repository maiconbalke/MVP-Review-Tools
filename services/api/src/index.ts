import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { randomUUID } from "crypto";
import {
    mkdirSync,
    writeFileSync,
    existsSync,
    readFileSync,
    createWriteStream,
    readdirSync,
} from "fs";
import { join } from "path";

const app = Fastify({ logger: true });

// npm costuma setar INIT_CWD com a pasta onde o comando npm foi executado (raiz do monorepo)
const ROOT_DIR = process.env.INIT_CWD ?? process.cwd();

const QUEUE_DIR = join(ROOT_DIR, "data", "queue");
const PROCESSING_DIR = join(ROOT_DIR, "data", "processing");
const DONE_DIR = join(ROOT_DIR, "data", "done");
const RESULTS_DIR = join(ROOT_DIR, "data", "results");
const UPLOADS_DIR = join(ROOT_DIR, "data", "uploads");
const WORK_DIR = join(ROOT_DIR, "data", "work");

for (const dir of [QUEUE_DIR, PROCESSING_DIR, DONE_DIR, RESULTS_DIR, UPLOADS_DIR, WORK_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

type JobBody = {
    repoUrl?: string;
    uploadPath?: string; // caminho do zip salvo
};

async function main() {
    // ✅ REGISTRE PLUGINS ANTES DAS ROTAS
    await app.register(cors, {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "OPTIONS"],
    });

    await app.register(multipart, {
        limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
            files: 1,
        },
    });

    app.get("/health", async () => ({ status: "ok" }));

    app.post("/analyze", async (request, reply) => {
        const json = (request.body ?? {}) as any;

        if (!json.repoUrl || typeof json.repoUrl !== "string") {
            return reply.status(400).send({
                error: "missing_repoUrl",
                message: "Envie repoUrl válido no JSON",
            });
        }

        const jobId = randomUUID();
        const body: JobBody = { repoUrl: json.repoUrl };

        let policyProfile = (request.query as any).policy as string | undefined ?? request.headers["x-policy-profile"] as string | undefined;
        if (!["standard", "strict", "security"].includes(policyProfile || "")) {
            policyProfile = "standard";
        }

        const jobFile = join(QUEUE_DIR, `${jobId}.json`);
        const payload = {
            jobId,
            createdAt: new Date().toISOString(),
            body,
            status: "queued",
            policyProfile,
        };

        writeFileSync(jobFile, JSON.stringify(payload, null, 2), "utf-8");
        app.log.info({ jobId, policyProfile, type: "repoUrl" }, "Job queued");

        return { jobId };
    });

    app.post("/analyze/upload", async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: "missing_file", message: "Envie um arquivo" });
        }

        if (data.fieldname !== "file") {
            return reply
                .status(400)
                .send({ error: "invalid_field", message: 'O campo deve se chamar "file"' });
        }

        const filename = (data.filename || "").toLowerCase();
        if (!filename.endsWith(".zip")) {
            return reply.status(400).send({ error: "invalid_file", message: "Envie um arquivo .zip" });
        }

        const jobId = randomUUID();
        const uploadPath = join(UPLOADS_DIR, `${jobId}.zip`);

        await new Promise<void>((resolve, reject) => {
            const ws = createWriteStream(uploadPath);
            data.file.pipe(ws);
            ws.on("finish", () => resolve());
            ws.on("error", reject);
        });

        const body: JobBody = { uploadPath };

        let policyProfile = (request.query as any).policy as string | undefined ?? request.headers["x-policy-profile"] as string | undefined;
        if (!["standard", "strict", "security"].includes(policyProfile || "")) {
            policyProfile = "standard";
        }

        const jobFile = join(QUEUE_DIR, `${jobId}.json`);
        const payload = {
            jobId,
            createdAt: new Date().toISOString(),
            body,
            status: "queued",
            policyProfile,
        };

        writeFileSync(jobFile, JSON.stringify(payload, null, 2), "utf-8");
        app.log.info({ jobId, policyProfile, type: "upload" }, "Job queued");

        return { jobId };
    });

    app.get("/jobs", async () => {
        const jobs: any[] = [];
        const dirs = [
            { dir: QUEUE_DIR, fallbackStatus: "queued" },
            { dir: PROCESSING_DIR, fallbackStatus: "processing" },
            { dir: DONE_DIR, fallbackStatus: "done" },
        ];

        for (const { dir, fallbackStatus } of dirs) {
            if (!existsSync(dir)) continue;
            const files = readdirSync(dir).filter(f => f.endsWith(".json"));
            for (const file of files) {
                try {
                    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
                    const hasResult = existsSync(join(RESULTS_DIR, `${data.jobId}.json`));
                    jobs.push({
                        jobId: data.jobId,
                        status: data.status || fallbackStatus,
                        createdAt: data.createdAt,
                        policyProfile: data.policyProfile,
                        hasResult
                    });
                } catch (e) {
                    // Ignore corrupted files
                }
            }
        }

        jobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return jobs.slice(0, 20);
    });

    app.get("/jobs/:jobId/status", async (request) => {
        const { jobId } = request.params as { jobId: string };

        const queueFile = join(QUEUE_DIR, `${jobId}.json`);
        const processingFile = join(PROCESSING_DIR, `${jobId}.json`);
        const doneFile = join(DONE_DIR, `${jobId}.json`);
        const resultsFile = join(RESULTS_DIR, `${jobId}.json`);

        const hasResult = existsSync(resultsFile);

        let status: "not_found" | "queued" | "processing" | "done" = "not_found";
        let targetFile: string | undefined;

        if (existsSync(processingFile)) { status = "processing"; targetFile = processingFile; }
        else if (existsSync(queueFile)) { status = "queued"; targetFile = queueFile; }
        else if (existsSync(doneFile)) { status = "done"; targetFile = doneFile; }

        let policyProfile: string | undefined;
        let createdAt: string | undefined;

        if (targetFile) {
            try {
                const data = JSON.parse(readFileSync(targetFile, "utf-8"));
                policyProfile = data.policyProfile;
                createdAt = data.createdAt;
                if (data.status) status = data.status;
            } catch (err) { }
        }

        return { jobId, status, hasResult, policyProfile, createdAt };
    });

    app.get("/jobs/:jobId", async (request, reply) => {
        const { jobId } = request.params as { jobId: string };
        const resultsFile = join(RESULTS_DIR, `${jobId}.json`);

        if (!existsSync(resultsFile)) return reply.status(404).send({ error: "not_found" });

        try {
            const data = readFileSync(resultsFile, "utf-8");
            return JSON.parse(data);
        } catch (err) {
            app.log.error({ err, jobId }, "Error reading results");
            return reply.status(500).send({ error: "internal_error" });
        }
    });

    await app.listen({ port: 3001, host: "0.0.0.0" });
}

main().catch((err) => {
    app.log.error(err);
    process.exit(1);
});