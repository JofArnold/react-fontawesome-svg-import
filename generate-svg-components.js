const { readdir, stat, readFile, writeFile } = require("fs-promise");
const Promise = require("bluebird");
const { join, extname, basename } = require("path");
const minimist = require("minimist");
const camelCase = require("lodash/camelCase");

const cliArgs = minimist(process.argv.slice(2));

const moduleCase = str => {
  const first = str.substr(0, 1).toUpperCase();
  const rest = camelCase(str.substr(1));
  return `${first}${rest}`;
};

const INPUT_PATH = cliArgs.i;
const OUTPUT_PATH = cliArgs.o;

let exportedFile = "";

if (!(typeof INPUT_PATH === "string")) {
  console.log("💩  Needs an input path (use -i)");
  process.exit(-1);
}

if (!(typeof OUTPUT_PATH === "string") && extname(OUTPUT_PATH) === "js") {
  console.log("💩  Needs an input path with js file extension (use -o)");
  process.exit(-1);
}

async function main() {
  const dirNames = await readdir(INPUT_PATH);
  const dirs = await Promise.filter(dirNames, async f => {
    const stats = await stat(join(INPUT_PATH, f));
    const isDir = stats.isDirectory();
    return isDir;
  });
  const svgModules = {};

  await Promise.map(dirs, async dirName => {
    const fileNames = await readdir(join(INPUT_PATH, dirName));
    const svgFileNames = fileNames.filter(f => /\.svg$/.test(f));
    await Promise.map(svgFileNames, async fileName => {
      const fileContents = await readFile(
        join(INPUT_PATH, dirName, fileName),
        "utf-8"
      );
      const moduleName = moduleCase(`${basename(fileName, "svg")}-${dirName}`);
      const processed = fileContents
        .replace(/\n|\r/g, "")
        .replace("<svg", `<SVG className={className || ""}`)
        .replace("</svg>", `</SVG>`);
      svgModules[moduleName] = processed;
    });
  });

  const svgDefinitions = Object.keys(
    svgModules
  ).reduce((running, moduleName) => {
    const svg = svgModules[moduleName];
    return `${running}const ${moduleName} = ({ className }) => ${svg};\n`;
  }, "");

  const exportModules = Object.keys(
    svgModules
  ).reduce((running, moduleName) => {
    return `${running}\n  ${moduleName},`;
  }, "");

  const file = `import React from "react";

const SVG = ({ className, ...rest }) => (
  <span
    className={\`\$\{className || ""} inline-flex h--1em w--1em svgwrapper\`}
  >
    <svg className="h--1em w--1em fill-current" {...rest} />
  </span>
);

${svgDefinitions}

export {${exportModules}
};`;
  await writeFile(OUTPUT_PATH, file);
}

main().then(() => console.log("👍  SVGs processed! "));
