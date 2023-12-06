import { defineConfig } from "vitepress";
import * as fs from "fs";
import * as path from "path";

const cmdl = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./cmdl.tmGrammar.json"), "utf-8")
);

export default defineConfig({
  lang: "en-US",
  title: "IBM Materials Notebook",
  description:
    "Custom Notebook Extension for VS Code for Enabling Experimental Documentation",
  base: "/ibm-materials-notebook/",
  markdown: {
    languages: [
      {
        name: "cmdl",
        ...cmdl,
      },
    ],
  },

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/index.html" },
      { text: "CMDL", link: "/cmdl/index.html" },
      { text: "GitHub", link: "https://github.com/IBM/ibm-materials-notebook" },
    ],
    sidebar: {
      "/guide": [
        {
          text: "Guide",
          link: "/guide/index.html",
          collapsed: false,
          items: [
            {
              text: "Basic Tutorial",
              link: "/guide/tutorial.html",
            },
            {
              text: "Import Tutorial",
              link: "/guide/import_tutorial.html",
            },
            {
              text: "Continuous-flow Tutorial",
              link: "/guide/flow_exp_tutorial.html",
            },
            {
              text: "Variable Tutorial",
              link: "/guide/variable_tutorial.html",
            },
          ],
        },
      ],
      "/cmdl": [
        {
          text: "CMDL",
          link: "/cmdl/index.html",
          collapsed: false,
          items: [
            { text: "CMDL Groups", link: "/cmdl/groups.html" },
            { text: "CMDL Properties", link: "/cmdl/properties.html" },
          ],
        },
      ],
    },
  },
});
