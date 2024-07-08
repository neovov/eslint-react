import { allValid, ruleTester } from "../../../../../test";
import rule, { RULE_NAME } from "./no-set-state-in-component-did-mount";

ruleTester.run(RULE_NAME, rule, {
  invalid: [
    {
      code: /* tsx */ `
        class Foo extends React.Component {
          componentDidMount() {
            this.setState({ foo: "bar" });
          }
        }
      `,
      errors: [
        { messageId: "NO_SET_STATE_IN_COMPONENT_DID_MOUNT" },
      ],
    },
    {
      code: /* tsx */ `
        const Foo = class extends React.Component {
          componentDidMount() {
            this.setState({ foo: "bar" });
          }
        }
      `,
      errors: [
        { messageId: "NO_SET_STATE_IN_COMPONENT_DID_MOUNT" },
      ],
    },
  ],
  valid: [
    ...allValid,
    /* tsx */ `
      class Foo extends React.Component {
        componentDidMount() {
          class Bar extends Baz {
            componentDidMount() {
              this.setState({ foo: "bar" });
            }
          }
        }
      }
    `,
  ],
});
