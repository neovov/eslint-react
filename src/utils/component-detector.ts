/* eslint-disable sonarjs/no-duplicate-string */
/**
 * This module is adapted from eslint-plugin-solid's
 * https://github.com/solidjs-community/eslint-plugin-solid/blob/main/src/rules/components-return-once.ts,
 * under the MIT license.
 *
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as MutList from "@effect/data/MutableList";
import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";
import invariant from "tiny-invariant";

import { AST } from "./ast";

export type FunctionNode =
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression;

export type PossibleFunctionalComponent = FunctionNode & {};

export function make<Ctx extends RuleContext<string, []>>(_: Ctx) {
    const components = new WeakSet<FunctionNode>();

    const functionStack = MutList.make<{ isComponent: boolean; node: FunctionNode }>();

    const currentFunction = () => MutList.tail(functionStack);

    const onFunctionEnter = (node: FunctionNode) => MutList.append(functionStack, { isComponent: false, node });

    const onFunctionExit = (node: FunctionNode) => {
        if (
            (AST.is(AST_NODE_TYPES.FunctionDeclaration)(node) && node.id?.name.match(/^[a-z]/u)) ||
            // "render props" aren't components
            AST.is(AST_NODE_TYPES.JSXExpressionContainer)(node.parent)
        ) {
            const currentFn = currentFunction();
            invariant(currentFn, "Unexpected empty function stack");
            currentFn.isComponent = false;
        }

        // Pop on exit
        MutList.pop(functionStack);
    };

    const ruleListener: RuleListener = {
        ArrowFunctionExpression: onFunctionEnter,
        FunctionDeclaration: onFunctionEnter,
        FunctionExpression: onFunctionEnter,
        // eslint-disable-next-line perfectionist/sort-objects
        "ArrowFunctionExpression:exit": onFunctionExit,
        "FunctionDeclaration:exit": onFunctionExit,
        "FunctionExpression:exit": onFunctionExit,
        JSXElement() {
            if (!MutList.isEmpty(functionStack)) {
                const currentFn = currentFunction();

                invariant(currentFn, "Unexpected empty function stack");

                currentFn.isComponent = true;
                components.add(currentFn.node);
            }
        },
        JSXFragment() {
            if (!MutList.isEmpty(functionStack)) {
                const currentFn = currentFunction();

                invariant(currentFn, "Unexpected empty function stack");

                currentFn.isComponent = true;
                components.add(currentFn.node);
            }
        },
        // ReturnStatement(node) {},
    };

    return {
        isComponent(node: FunctionNode) {
            return components.has(node);
        },
        ruleListener,
    };
}
