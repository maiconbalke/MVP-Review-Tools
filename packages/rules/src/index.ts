export * from "./types.js";
import { Rule } from "./types.js";
import { R001 } from "./rules/R001_package_json.js";
import { R002 } from "./rules/R002_tsconfig.js";
import { R003 } from "./rules/R003_dockerfile.js";
import { R010 } from "./rules/R010_readme.js";
import { R011 } from "./rules/R011_license.js";
import { R012 } from "./rules/R012_ci_config.js";
import { R013 } from "./rules/R013_env_committed.js";
import { R014 } from "./rules/R014_node_modules_committed.js";
import { R020 } from "./rules/R020_dependencies_missing.js";
import { R021 } from "./rules/R021_dev_dependencies_only.js";
import { R022 } from "./rules/R022_private_flag_missing.js";
import { R023 } from "./rules/R023_localhost_hardcoded.js";
import { R024 } from "./rules/R024_gitignore_missing.js";

export const rules: Rule[] = [
    R001, R002, R003, R010, R011, R012, R013, R014,
    R020, R021, R022, R023, R024
];
