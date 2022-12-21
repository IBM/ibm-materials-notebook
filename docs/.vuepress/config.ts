import { defineUserConfig, defaultTheme } from "vuepress";
import { shikiPlugin } from "@vuepress/plugin-shiki";

export default defineUserConfig({
  lang: "en-US",
  title: "IBM Materials Notebook",
  description: "Documentation for IBM Materials Notebook",
  base: "/ibm-materials/ibm-materials-notebook/",

  plugins: [
    shikiPlugin({
      theme: "dark-plus",
      langs: [
        "bash",
        {
          id: "cmdl",
          scopeName: "source.cmdl",
          path: "../../syntaxes/cmdl.tmGrammar.json",
        },
      ],
    }),
  ],

  theme: defaultTheme({
    navbar: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide" },
      { text: "CMDL", link: "/cmdl" },
    ],
    sidebar: {
      "/guide": [
        {
          text: "Guide",
          link: "/guide",
          collapsible: false,
          children: [
            "/guide/tutorial.md",
            "/guide/import_tutorial.md",
            "/guide/flow_exp_tutorial.md",
          ],
        },
      ],
      "/cmdl": [
        {
          text: "CMDL",
          link: "/cmdl",
          collapsible: false,
          children: ["/cmdl/groups.md", "/cmdl/properties.md"],
        },
      ],
    },
  }),
});
