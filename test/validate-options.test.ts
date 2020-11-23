import webpack from "webpack";

import WIPLWebpackTestCompiler from "./helpers/WIPLWebpackTestCompiler";

describe.each([4, 5] as const)("v%d validate options", (webpackVersion) => {
  const tests = {
    format: {
      success: ["base64", "hex", "rgb", "array"],
      failure: [true],
    },
    size: {
      success: [1, 100, "original"],
      failure: [0, -1],
    },
    color: {
      success: [
        "simple",
        "sqrt",
        "dominant",
        "#000",
        "#038281",
        "#03828110",
        { r: 2, g: 120, b: 24 },
        "red",
      ],
      failure: [true, "#0", "#MMMMMM"],
    },
    backgroundColor: {
      success: ["#000", "#038281", { r: 2, g: 120, b: 24 }, "red"],
      failure: [
        true,
        "#0",
        "#MMMMMM",
        "#03828110",
        { r: 2, g: 120, b: 24, a: 0.5 },
      ],
    },
    esModule: {
      success: [true, false],
      failure: ["true"],
    },
  };

  function createTestCase(
    key: string,
    value: any,
    type: "success" | "failure"
  ): void {
    it(`should ${
      type === "success" ? "successfully validate" : "throw an error on"
    } the "${key}" option with ${JSON.stringify(value)} value`, async () => {
      const compiler = new WIPLWebpackTestCompiler({ webpackVersion });

      let stats;

      try {
        stats = (
          await compiler.compile({
            loaderOptions: {
              [key]: value,
            },
            throwOnError: false,
          })
        ).stats;
      } finally {
        if (type === "success") {
          expect((stats as webpack.Stats).hasErrors()).toBe(false);
        } else if (type === "failure") {
          const {
            compilation: { errors },
          } = stats as any;

          expect(errors).toHaveLength(1);
          expect(() => {
            throw new Error(errors[0].error.message);
          }).toThrowErrorMatchingSnapshot();
        }
      }
    }, 60000);
  }

  for (const [key, values] of Object.entries(tests)) {
    for (const type of Object.keys(values) as ("success" | "failure")[]) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
