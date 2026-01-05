import fs from "fs";
import path from "path";

const newVersion = process.env.npm_package_version;

const manifestPath = path.join(process.cwd(), "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));

const versionsPath = path.join(process.cwd(), "versions.json");
const versions = JSON.parse(fs.readFileSync(versionsPath, "utf8"));
versions[newVersion] = manifest.minAppVersion;
fs.writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));

