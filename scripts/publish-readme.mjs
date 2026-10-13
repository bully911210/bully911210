// The generator writes v10/README.md with paths relative to v10/. GitHub
// shows the profile README from the repo root, so copy it up and point the
// image paths at v10/generated/.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../v10/README.md", import.meta.url), "utf8");
const out = src.replace(/(srcset|src)="generated\//g, '$1="v10/generated/');
if (out === src) throw new Error("no generated/ paths found in v10/README.md");
writeFileSync(new URL("../README.md", import.meta.url), out);
console.log("README.md written");
