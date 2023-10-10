// import { Drawer } from "./Drawer";
import Parser from "./Parser";
import { ReactionParser } from "./ReactionParser";
import { SvgDrawer } from "./SvgDrawer";
import { ReactionDrawer } from "./ReactionDrawer";
import { SvgWrapper } from "./SvgWrapper";
import { Options } from "./Options";

export class SmilesDrawer {
  drawer: SvgDrawer;
  reactionDrawer: ReactionDrawer;

  constructor(moleculeOptions = {}, reactionOptions = {}) {
    this.drawer = new SvgDrawer(moleculeOptions);

    // moleculeOptions gets edited in reactionOptions, so clone
    this.reactionDrawer = new ReactionDrawer(
      reactionOptions,
      JSON.parse(JSON.stringify(this.drawer.opts))
    );
  }

  static apply(
    moleculeOptions = {},
    reactionOptions = {},
    attribute = "data-smiles",
    theme = "light",
    successCallback = null,
    errorCallback = null
  ) {
    const drawer = new SmilesDrawer(moleculeOptions, reactionOptions);
    drawer.apply(attribute, theme, successCallback, errorCallback);
  }

  apply(
    attribute = "data-smiles",
    theme = "light",
    successCallback = null,
    errorCallback = null
  ) {
    const elements = document.querySelectorAll(`[${attribute}]`);
    elements.forEach((element) => {
      const smiles: any = element.getAttribute(attribute);
      let currentTheme: any = theme;

      if (element.hasAttribute("data-smiles-theme")) {
        currentTheme = element.getAttribute("data-smiles-theme");
      }

      if (
        element.hasAttribute("data-smiles-options") ||
        element.hasAttribute("data-smiles-reaction-options")
      ) {
        let moleculeOptions = {};
        if (element.hasAttribute("data-smiles-options")) {
          moleculeOptions = JSON.parse(
            element
              .getAttribute("data-smiles-options")
              ?.replaceAll("'", '"') as string
          );
        }

        let reactionOptions = {};
        if (element.hasAttribute("data-smiles-reaction-options")) {
          reactionOptions = JSON.parse(
            element
              .getAttribute("data-smiles-reaction-options")
              ?.replaceAll("'", '"') as string
          );
        }

        const smilesDrawer = new SmilesDrawer(moleculeOptions, reactionOptions);
        smilesDrawer.draw(
          smiles,
          element,
          currentTheme,
          (successCallback = null),
          (errorCallback = null)
        );
      } else {
        this.draw(
          smiles,
          element,
          currentTheme,
          (successCallback = null),
          (errorCallback = null)
        );
      }
    });
  }

  draw(
    smiles: string,
    target: any,
    theme = "light",
    successCallback = null,
    errorCallback: any = null
  ) {
    // get the settings
    let rest = [];
    [smiles, ...rest] = smiles.split(" ");
    const info = rest.join(" ");

    let settings = {};

    if (info.includes("__")) {
      const settingsString = info.substring(
        info.indexOf("__") + 2,
        info.lastIndexOf("__")
      );

      settings = JSON.parse(settingsString.replaceAll("'", '"'));
    }

    const defaultSettings = {
      textAboveArrow: "{reagents}",
      textBelowArrow: "",
    };

    //@ts-ignore
    settings = Options.extend(true, defaultSettings, settings);

    if (smiles.includes(">")) {
      try {
        this.drawReaction(smiles, target, theme, settings, successCallback);
      } catch (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          console.error(err);
        }
      }
    } else {
      try {
        this.drawMolecule(smiles, target, theme, successCallback);
      } catch (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          console.error(err);
        }
      }
    }
  }

  drawMolecule(smiles: string, target: any, theme: any, callback: any) {
    const parseTree = Parser.parse(smiles);

    if (target === null || target === "svg") {
      const svg = this.drawer.draw(parseTree, null, theme);
      const dims = this.getDimensions(svg);
      svg.setAttributeNS(null, "width", "" + dims.w);
      svg.setAttributeNS(null, "height", "" + dims.h);
      if (callback) {
        callback(svg);
      }
    } else if (target === "canvas") {
      const canvas = this.svgToCanvas(this.drawer.draw(parseTree, null, theme));
      if (callback) {
        callback(canvas);
      }
    } else if (target === "img") {
      const img = this.svgToImg(this.drawer.draw(parseTree, null, theme));
      if (callback) {
        callback(img);
      }
    } else if (target instanceof HTMLImageElement) {
      this.svgToImg(this.drawer.draw(parseTree, null, theme), target);
      if (callback) {
        callback(target);
      }
    } else if (target instanceof SVGElement) {
      this.drawer.draw(parseTree, target, theme);
      if (callback) {
        callback(target);
      }
    } else {
      const elements = document.querySelectorAll(target);
      elements.forEach((element) => {
        const tag = element.nodeName.toLowerCase();
        if (tag === "svg") {
          this.drawer.draw(parseTree, element, theme);
          // let dims = this.getDimensions(element);
          // element.setAttributeNS(null, 'width', '' + dims.w);
          // element.setAttributeNS(null, 'height', '' + dims.h);
          if (callback) {
            callback(element);
          }
        } else if (tag === "canvas") {
          this.svgToCanvas(this.drawer.draw(parseTree, null, theme), element);
          if (callback) {
            callback(element);
          }
        } else if (tag === "img") {
          this.svgToImg(this.drawer.draw(parseTree, null, theme), element);
          if (callback) {
            callback(element);
          }
        }
      });
    }
  }

  drawReaction(
    smiles: string,
    target: any,
    theme: any,
    settings: any,
    callback: any
  ) {
    const reaction = ReactionParser.parse(smiles);

    if (target === null || target === "svg") {
      const svg = this.reactionDrawer.draw(reaction, null, theme);
      const dims = this.getDimensions(svg);
      svg.setAttributeNS(null, "width", "" + dims.w);
      svg.setAttributeNS(null, "height", "" + dims.h);
      if (callback) {
        callback(svg);
      }
    } else if (target === "canvas") {
      const canvas = this.svgToCanvas(
        this.reactionDrawer.draw(
          reaction,
          null,
          theme,
          settings.textAboveArrow,
          settings.textBelowArrow
        )
      );
      if (callback) {
        callback(canvas);
      }
    } else if (target === "img") {
      const img = this.svgToImg(
        this.reactionDrawer.draw(
          reaction,
          null,
          theme,
          settings.textAboveArrow,
          settings.textBelowArrow
        )
      );
      if (callback) {
        callback(img);
      }
    } else if (target instanceof HTMLImageElement) {
      this.svgToImg(
        this.reactionDrawer.draw(
          reaction,
          null,
          theme,
          settings.textAboveArrow,
          settings.textBelowArrow
        ),
        target
      );
      if (callback) {
        callback(target);
      }
    } else if (target instanceof SVGElement) {
      this.reactionDrawer.draw(
        reaction,
        target,
        theme,
        settings.textAboveArrow,
        settings.textBelowArrow
      );
      if (callback) {
        callback(target);
      }
    } else {
      const elements = document.querySelectorAll(target);
      elements.forEach((element) => {
        const tag = element.nodeName.toLowerCase();
        if (tag === "svg") {
          this.reactionDrawer.draw(
            reaction,
            element,
            theme,
            settings.textAboveArrow,
            settings.textBelowArrow
          );
          // The svg has to have a css width and height set for the other
          // tags, however, here it would overwrite the chosen width and height
          if (this.reactionDrawer.opts.scale <= 0) {
            element.style.width = null;
            element.style.height = null;
          }
          // let dims = this.getDimensions(element);
          // element.setAttributeNS(null, 'width', '' + dims.w);
          // element.setAttributeNS(null, 'height', '' + dims.h);
          if (callback) {
            callback(element);
          }
        } else if (tag === "canvas") {
          this.svgToCanvas(
            this.reactionDrawer.draw(
              reaction,
              null,
              theme,
              settings.textAboveArrow,
              settings.textBelowArrow
            ),
            element
          );
          if (callback) {
            callback(element);
          }
        } else if (tag === "img") {
          this.svgToImg(
            this.reactionDrawer.draw(
              reaction,
              null,
              theme,
              settings.textAboveArrow,
              settings.textBelowArrow
            ),
            element
          );
          if (callback) {
            callback(element);
          }
        }
      });
    }
  }

  svgToCanvas(svg: any, canvas: any = null) {
    if (canvas === null) {
      canvas = document.createElement("canvas");
    }

    const dims = this.getDimensions(canvas, svg);

    SvgWrapper.svgToCanvas(svg, canvas, dims.w, dims.h);
    return canvas;
  }

  svgToImg(svg: any, img: any = null) {
    if (img === null) {
      img = document.createElement("img");
    }

    const dims = this.getDimensions(img, svg);

    SvgWrapper.svgToImg(svg, img, dims.w, dims.h);
    return img;
  }

  /**
   *
   * @param {HTMLImageElement|HTMLCanvasElement|SVGElement} element
   * @param {SVGElement} svg
   * @returns {{w: Number, h: Number}} The width and height.
   */
  getDimensions(element: any, svg: any = null) {
    let w = this.drawer.opts.width;
    let h = this.drawer.opts.height;

    if (this.drawer.opts.scale <= 0) {
      if (w === null) {
        w = element.width;
      }

      if (h === null) {
        h = element.height;
      }

      if (element.style.width !== "") {
        w = parseInt(element.style.width);
      }

      if (element.style.height !== "") {
        h = parseInt(element.style.height);
      }
    } else if (svg) {
      w = parseFloat(svg.style.width);
      h = parseFloat(svg.style.height);
    }

    return { w: w, h: h };
  }
}
