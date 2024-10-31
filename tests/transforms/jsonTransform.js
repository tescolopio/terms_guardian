// tests/transforms/jsonTransform.js
module.exports = {
    process(sourceText) {
      return {
        code: `module.exports = ${sourceText};`
      };
    }
  };