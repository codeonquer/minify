"use strict";

module.exports = function({ types: t }) {
  const INFINITY = t.binaryExpression(
    "/",
    t.numericLiteral(1),
    t.numericLiteral(0)
  );
  return {
    name: "minify-infinity",
    visitor: {
      // Infinity -> 1 / 0
      Identifier(path) {
        if (path.node.name !== "Infinity") {
          return;
        }

        // It's a referenced identifier
        // 作为引用被使用
        if (path.scope.getBinding("Infinity")) {
          return;
        }

        // 作为对象属性被定义
        if (path.parentPath.isObjectProperty({ key: path.node })) {
          return;
        }

        // 作为对象属性被使用
        if (path.parentPath.isMemberExpression()) {
          return;
        }

        const bindingIds = path.parentPath.getBindingIdentifierPaths();

        if (
          bindingIds["Infinity"] === path &&
          // ObjectProperty is common for ObjectExpression and ObjectPattern and only
          // one of them is a Binding, the other is simply a reference
          !path.parentPath.parentPath.isObjectExpression()
        ) {
          return;
        }

        path.replaceWith(INFINITY);
      }
    }
  };
};
